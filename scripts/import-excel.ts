import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import * as XLSX from "xlsx";
import { PrismaClient, type Prisma, AssetKind, AssetRole, PublishStatus, SnapshotMatchStatus, SourceType } from "@prisma/client";
import {
  canonicalProductFamilySeeds,
  extractSeriesCode,
  getFamilySlugsForLegacyCatalogTitle,
  resolveProductFamilySeed,
  resolveProductTypeCode,
} from "../lib/products/catalog-master-data";

const prisma = new PrismaClient();
const workbookPath = "data/选型程序算法.xlsx";
const databaseSheetName = "数据库";
const legacySiteRoot = "/Users/maguibo/Downloads/ekdcn.com";
const legacyBaseUrl = "https://www.ekdchina.com";

const supportedHeaders = [
  "产品型号",
  "类型",
  "缓冲行程（mm)",
  "每次最大吸收能量(Nm/c)",
  "每小时最大吸收能量(Nm/h)",
  "最大冲击力N",
  "最大推进力N",
  "总长度",
  "螺纹尺寸",
  "产品照片",
] as const;

type RawProductRow = Record<string, unknown>;

type LegacyCatalogCard = {
  title: string;
  pdfPath: string;
  imagePath: string | null;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function parseDecimal(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value.toFixed(3);
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) {
      return null;
    }

    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? null : parsed.toFixed(3);
  }

  return null;
}

function parseText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text === "" ? null : text;
}

function decodeHtml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function toLegacyRemoteUrl(relativePath: string) {
  return `${legacyBaseUrl}/${relativePath.replace(/^\/+/, "")}`;
}

function inferMimeType(filePath: string | null | undefined) {
  const normalized = (filePath ?? "").toLowerCase();
  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".webp")) return "image/webp";
  return null;
}

async function readIfExists(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function upsertAsset(input: {
  assetKey: string;
  kind: AssetKind;
  sourceOrigin: string;
  sourcePath?: string | null;
  publicPath?: string | null;
  remoteUrl?: string | null;
  mimeType?: string | null;
  locale?: string | null;
  title?: string | null;
  metadataJson?: Prisma.InputJsonValue | null;
}) {
  return prisma.asset.upsert({
    where: { assetKey: input.assetKey },
    update: {
      kind: input.kind,
      sourceOrigin: input.sourceOrigin,
      sourcePath: input.sourcePath ?? null,
      publicPath: input.publicPath ?? null,
      remoteUrl: input.remoteUrl ?? null,
      mimeType: input.mimeType ?? null,
      locale: input.locale ?? null,
      title: input.title ?? null,
      metadataJson: input.metadataJson ?? undefined,
    },
    create: {
      assetKey: input.assetKey,
      kind: input.kind,
      sourceOrigin: input.sourceOrigin,
      sourcePath: input.sourcePath ?? null,
      publicPath: input.publicPath ?? null,
      remoteUrl: input.remoteUrl ?? null,
      mimeType: input.mimeType ?? null,
      locale: input.locale ?? null,
      title: input.title ?? null,
      metadataJson: input.metadataJson ?? undefined,
    },
  });
}

async function seedProductFamilies() {
  const familyIdBySlug = new Map<string, string>();

  for (const [index, seed] of canonicalProductFamilySeeds.entries()) {
    const family = await prisma.productFamily.upsert({
      where: { slug: seed.slug },
      update: {
        key: seed.key,
        sortOrder: index,
        isActive: true,
      },
      create: {
        key: seed.key,
        slug: seed.slug,
        sortOrder: index,
        isActive: true,
      },
    });

    familyIdBySlug.set(seed.slug, family.id);

    for (const locale of ["en", "zh-cn"] as const) {
      const translation = seed.translations[locale];

      await prisma.productFamilyTranslation.upsert({
        where: {
          familyId_locale: {
            familyId: family.id,
            locale,
          },
        },
        update: {
          name: translation.name,
          tag: translation.tag ?? null,
          summary: translation.summary,
          description: translation.description,
        },
        create: {
          familyId: family.id,
          locale,
          name: translation.name,
          tag: translation.tag ?? null,
          summary: translation.summary,
          description: translation.description,
        },
      });
    }
  }

  return familyIdBySlug;
}

async function linkFamilyAsset(familyId: string, assetId: string, role: AssetRole, sortOrder: number) {
  await prisma.productFamilyAsset.upsert({
    where: {
      familyId_assetId_role: {
        familyId,
        assetId,
        role,
      },
    },
    update: {
      sortOrder,
    },
    create: {
      familyId,
      assetId,
      role,
      sortOrder,
    },
  });
}

async function linkProductAsset(productId: string, assetId: string, role: AssetRole, sortOrder: number) {
  await prisma.productAsset.upsert({
    where: {
      productId_assetId_role: {
        productId,
        assetId,
        role,
      },
    },
    update: {
      sortOrder,
    },
    create: {
      productId,
      assetId,
      role,
      sortOrder,
    },
  });
}

function extractLegacyCatalogCards(html: string): LegacyCatalogCard[] {
  const cards: LegacyCatalogCard[] = [];
  const pattern =
    /href="(uploads\/files\/[^"]+\.pdf)"[\s\S]*?<img[^>]+src="(uploads\/images\/[^"]+)"[\s\S]*?<span><a[^>]*>([^<]+)<\/a><\/span>/gi;

  for (const match of html.matchAll(pattern)) {
    cards.push({
      pdfPath: match[1],
      imagePath: match[2] ?? null,
      title: decodeHtml(match[3].trim()),
    });
  }

  return cards;
}

function extractMetaDescription(html: string) {
  const match = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return match ? decodeHtml(match[1].trim()) : null;
}

function extractInlineImagePaths(html: string) {
  const imageSet = new Set<string>();
  const pattern = /src="(\.\.\/|..\/..\/)?(uploads\/images\/[^"]+)"/gi;

  for (const match of html.matchAll(pattern)) {
    imageSet.add(match[2]);
  }

  return [...imageSet];
}

async function ingestRepositoryCatalogAssets(familyIdBySlug: Map<string, string>) {
  const repoCatalogs = [
    {
      assetKey: "repo:catalog:ekd-full",
      title: "EKD Full Product Catalog",
      publicPath: "/catalogs/ekd-full-catalog.pdf",
      sourcePath: path.resolve("public/catalogs/ekd-full-catalog.pdf"),
      familySlugs: [
        "adjustable-shock-absorbers",
        "non-adjustable-shock-absorbers",
        "super-long-life-shock-absorbers",
        "heavy-duty-shock-absorbers",
        "heavy-industry-buffers",
      ],
    },
    {
      assetKey: "repo:catalog:vibration-isolators-2024",
      title: "Vibration Isolator Catalog 2024",
      publicPath: "/catalogs/vibration-isolator-catalog-2024.pdf",
      sourcePath: path.resolve("public/catalogs/vibration-isolator-catalog-2024.pdf"),
      familySlugs: [
        "wire-rope-vibration-isolators",
        "anti-impact-compound-vibration-isolators",
        "all-metal-equal-stiffness-vibration-isolators",
        "steel-mesh-pad-rubber-vibration-isolators",
        "special-vibration-isolators",
      ],
    },
  ];

  for (const catalog of repoCatalogs) {
    const asset = await upsertAsset({
      assetKey: catalog.assetKey,
      kind: AssetKind.PDF,
      sourceOrigin: "REPO_PUBLIC",
      sourcePath: catalog.sourcePath,
      publicPath: catalog.publicPath,
      remoteUrl: null,
      mimeType: "application/pdf",
      title: catalog.title,
    });

    for (const [sortOrder, familySlug] of catalog.familySlugs.entries()) {
      const familyId = familyIdBySlug.get(familySlug);
      if (!familyId) continue;
      await linkFamilyAsset(familyId, asset.id, AssetRole.CATALOG, sortOrder);
    }
  }
}

async function ingestLegacyCatalogAssets(familyIdBySlug: Map<string, string>) {
  const catalogHtml = await readIfExists(path.join(legacySiteRoot, "catalog_en.html"));
  if (!catalogHtml) {
    return;
  }

  const cards = extractLegacyCatalogCards(catalogHtml);

  for (const [sortOrder, card] of cards.entries()) {
    const pdfAsset = await upsertAsset({
      assetKey: `legacy:catalog-pdf:${card.pdfPath}`,
      kind: AssetKind.PDF,
      sourceOrigin: "LEGACY_SITE",
      sourcePath: path.join(legacySiteRoot, card.pdfPath),
      publicPath: null,
      remoteUrl: toLegacyRemoteUrl(card.pdfPath),
      mimeType: "application/pdf",
      locale: "zh-cn",
      title: card.title,
      metadataJson: toJsonValue({ legacyCatalogTitle: card.title }),
    });

    if (card.imagePath) {
      await upsertAsset({
        assetKey: `legacy:catalog-image:${card.imagePath}`,
        kind: AssetKind.IMAGE,
        sourceOrigin: "LEGACY_SITE",
        sourcePath: path.join(legacySiteRoot, card.imagePath),
        publicPath: null,
        remoteUrl: toLegacyRemoteUrl(card.imagePath),
        mimeType: inferMimeType(card.imagePath),
        locale: "zh-cn",
        title: `${card.title} cover`,
        metadataJson: toJsonValue({ legacyCatalogTitle: card.title }),
      });
    }

    for (const familySlug of getFamilySlugsForLegacyCatalogTitle(card.title)) {
      const familyId = familyIdBySlug.get(familySlug);
      if (!familyId) continue;
      await linkFamilyAsset(familyId, pdfAsset.id, AssetRole.CATALOG, sortOrder);
    }
  }
}

async function ingestLegacyFamilyAssets(familyIdBySlug: Map<string, string>) {
  for (const seed of canonicalProductFamilySeeds) {
    if (!seed.legacyPageId) {
      continue;
    }

    const familyId = familyIdBySlug.get(seed.slug);
    if (!familyId) {
      continue;
    }

    const filePath = path.join(legacySiteRoot, "product_list", `${seed.legacyPageId}.html`);
    const html = await readIfExists(filePath);
    if (!html) {
      continue;
    }

    const metaDescription = extractMetaDescription(html);

    if (metaDescription) {
      for (const locale of ["en", "zh-cn"] as const) {
        const baseTranslation = seed.translations[locale];
        await prisma.productFamilyTranslation.update({
          where: {
            familyId_locale: {
              familyId,
              locale,
            },
          },
          data: {
            applicationNotes: locale === "en" ? metaDescription : baseTranslation.description,
          },
        });
      }
    }

    const imagePaths = extractInlineImagePaths(html).slice(0, 3);
    for (const [sortOrder, imagePath] of imagePaths.entries()) {
      const imageAsset = await upsertAsset({
        assetKey: `legacy:family-image:${seed.slug}:${imagePath}`,
        kind: AssetKind.IMAGE,
        sourceOrigin: "LEGACY_SITE",
        sourcePath: path.join(legacySiteRoot, imagePath),
        publicPath: null,
        remoteUrl: toLegacyRemoteUrl(imagePath),
        mimeType: inferMimeType(imagePath),
        title: `${seed.slug} legacy image ${sortOrder + 1}`,
        metadataJson: toJsonValue({
          familySlug: seed.slug,
          legacyPageId: seed.legacyPageId,
        }),
      });

      await linkFamilyAsset(familyId, imageAsset.id, AssetRole.GALLERY, sortOrder);
    }
  }
}

async function upsertExcelPhotoPlaceholder(photoRef: string) {
  return upsertAsset({
    assetKey: `excel:photo-ref:${photoRef}`,
    kind: AssetKind.IMAGE,
    sourceOrigin: "EXCEL",
    sourcePath: null,
    publicPath: null,
    remoteUrl: null,
    mimeType: null,
    title: `Excel photo reference ${photoRef}`,
    metadataJson: toJsonValue({
      excelPhotoRef: photoRef,
      status: "pending-image-match",
    }),
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Create a .env file before running the import.");
  }

  const familyIdBySlug = await seedProductFamilies();
  await ingestRepositoryCatalogAssets(familyIdBySlug);
  await ingestLegacyCatalogAssets(familyIdBySlug);
  await ingestLegacyFamilyAssets(familyIdBySlug);

  const workbook = XLSX.readFile(workbookPath);
  const worksheet = workbook.Sheets[databaseSheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${databaseSheetName}" was not found in ${workbookPath}.`);
  }

  const rawHeaderRows = XLSX.utils.sheet_to_json<Array<unknown>>(worksheet, {
    header: 1,
    range: 0,
    blankrows: false,
  });
  const headers = Array.isArray(rawHeaderRows[0]) ? rawHeaderRows[0].map((value) => String(value ?? "").trim()) : [];
  const missingHeaders = supportedHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing expected headers in Excel sheet: ${missingHeaders.join(", ")}`);
  }

  const rows = XLSX.utils.sheet_to_json<RawProductRow>(worksheet, {
    defval: null,
  });

  let created = 0;
  let updated = 0;
  let failed = 0;
  let matchedFamilies = 0;
  let pendingPhotoReferences = 0;

  const errors: Array<{ index: number; model?: string; error: string }> = [];

  for (const [index, row] of rows.entries()) {
    const model = parseText(row["产品型号"]);
    const legacyTypeLabel = parseText(row["类型"]);

    if (!model) {
      failed += 1;
      errors.push({
        index: index + 2,
        error: "Missing product model.",
      });
      continue;
    }

    try {
      const familySeed = resolveProductFamilySeed(model, legacyTypeLabel);
      const familyId = familySeed ? familyIdBySlug.get(familySeed.slug) ?? null : null;
      const seriesCode = extractSeriesCode(model);
      const typeCode = resolveProductTypeCode(model, legacyTypeLabel);
      const photoRef = parseText(row["产品照片"]);

      const existing = await prisma.product.findUnique({
        where: { model },
        select: { id: true },
      });

      const product = await prisma.product.upsert({
        where: { model },
        update: {
          familyId,
          type: legacyTypeLabel,
          legacyTypeLabel,
          typeCode,
          seriesCode,
          strokeMm: parseDecimal(row["缓冲行程（mm)"]),
          energyPerCycleNm: parseDecimal(row["每次最大吸收能量(Nm/c)"]),
          energyPerHourNm: parseDecimal(row["每小时最大吸收能量(Nm/h)"]),
          maxImpactForceN: parseDecimal(row["最大冲击力N"]),
          maxThrustForceN: parseDecimal(row["最大推进力N"]),
          totalLengthMm: parseDecimal(row["总长度"]),
          threadSize: parseText(row["螺纹尺寸"]),
          photoUrl: null,
          sourceProductPhotoRef: photoRef,
          rawDataJson: toJsonValue(row),
          publishStatus: PublishStatus.PUBLISHED,
          isActive: true,
        },
        create: {
          model,
          familyId,
          type: legacyTypeLabel,
          legacyTypeLabel,
          typeCode,
          seriesCode,
          strokeMm: parseDecimal(row["缓冲行程（mm)"]),
          energyPerCycleNm: parseDecimal(row["每次最大吸收能量(Nm/c)"]),
          energyPerHourNm: parseDecimal(row["每小时最大吸收能量(Nm/h)"]),
          maxImpactForceN: parseDecimal(row["最大冲击力N"]),
          maxThrustForceN: parseDecimal(row["最大推进力N"]),
          totalLengthMm: parseDecimal(row["总长度"]),
          threadSize: parseText(row["螺纹尺寸"]),
          photoUrl: null,
          sourceProductPhotoRef: photoRef,
          rawDataJson: toJsonValue(row),
          publishStatus: PublishStatus.PUBLISHED,
          isActive: true,
        },
      });

      if (familyId) {
        matchedFamilies += 1;
      }

      if (photoRef) {
        pendingPhotoReferences += 1;
        const photoAsset = await upsertExcelPhotoPlaceholder(photoRef);
        await linkProductAsset(product.id, photoAsset.id, AssetRole.PRIMARY_IMAGE, 0);
      }

      await prisma.productTranslation.upsert({
        where: {
          productId_locale: {
            productId: product.id,
            locale: "en",
          },
        },
        update: {
          displayName: model,
          shortSummary: null,
        },
        create: {
          productId: product.id,
          locale: "en",
          displayName: model,
          shortSummary: null,
        },
      });

      await prisma.productTranslation.upsert({
        where: {
          productId_locale: {
            productId: product.id,
            locale: "zh-cn",
          },
        },
        update: {
          displayName: model,
          shortSummary: null,
        },
        create: {
          productId: product.id,
          locale: "zh-cn",
          displayName: model,
          shortSummary: null,
        },
      });

      const sourceRef = `${workbookPath}#${databaseSheetName}:row-${index + 2}`;
      await prisma.productSourceSnapshot.deleteMany({
        where: {
          productId: product.id,
          sourceType: SourceType.EXCEL,
          sourceRef,
        },
      });
      await prisma.productSourceSnapshot.create({
        data: {
          productId: product.id,
          sourceType: SourceType.EXCEL,
          sourceRef,
          rawJson: toJsonValue(row),
          matchStatus: familyId ? SnapshotMatchStatus.MATCHED : SnapshotMatchStatus.PARTIAL,
        },
      });

      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }
    } catch (error) {
      failed += 1;
      errors.push({
        index: index + 2,
        model,
        error: error instanceof Error ? error.message : "Unknown import error.",
      });
    }
  }

  console.log("Import complete.");
  console.log(
    JSON.stringify(
      {
        workbookPath,
        databaseSheetName,
        totalRows: rows.length,
        created,
        updated,
        failed,
        matchedFamilies,
        pendingPhotoReferences,
      },
      null,
      2,
    ),
  );

  if (errors.length > 0) {
    console.log("Failed rows:");
    for (const item of errors.slice(0, 20)) {
      console.log(JSON.stringify(item));
    }
  }
}

main()
  .catch((error) => {
    console.error("Excel import failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
