-- CreateEnum
CREATE TYPE "ProductTypeCode" AS ENUM ('ADJUSTABLE', 'NON_ADJUSTABLE', 'HEAVY_DUTY', 'BUFFER', 'ISOLATOR', 'SPECIALTY');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('IMAGE', 'PDF', 'DRAWING', 'CAD', 'MODEL_3D', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetRole" AS ENUM ('PRIMARY_IMAGE', 'GALLERY', 'DATASHEET', 'CATALOG', 'CAD', 'DRAWING', 'OTHER');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('EXCEL', 'LEGACY_SITE', 'PDF_CATALOG', 'MANUAL');

-- CreateEnum
CREATE TYPE "SnapshotMatchStatus" AS ENUM ('MATCHED', 'PARTIAL', 'UNMATCHED', 'REVIEWED');

-- CreateTable
CREATE TABLE "ProductFamily" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFamilyTranslation" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "applicationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFamilyTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetKey" TEXT NOT NULL,
    "kind" "AssetKind" NOT NULL,
    "sourceOrigin" TEXT NOT NULL,
    "sourcePath" TEXT,
    "publicPath" TEXT,
    "remoteUrl" TEXT,
    "mimeType" TEXT,
    "locale" TEXT,
    "title" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTranslation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "shortSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAsset" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "role" "AssetRole" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFamilyAsset" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "role" "AssetRole" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFamilyAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSourceSnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "sourceType" "SourceType" NOT NULL,
    "sourceRef" TEXT NOT NULL,
    "rawJson" JSONB NOT NULL,
    "matchStatus" "SnapshotMatchStatus" NOT NULL DEFAULT 'MATCHED',
    "parsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSourceSnapshot_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN     "familyId" TEXT,
ADD COLUMN     "legacyTypeLabel" TEXT,
ADD COLUMN     "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "seriesCode" TEXT,
ADD COLUMN     "sourceProductPhotoRef" TEXT,
ADD COLUMN     "typeCode" "ProductTypeCode";

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamily_key_key" ON "ProductFamily"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamily_slug_key" ON "ProductFamily"("slug");

-- CreateIndex
CREATE INDEX "ProductFamily_isActive_sortOrder_idx" ON "ProductFamily"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamilyTranslation_familyId_locale_key" ON "ProductFamilyTranslation"("familyId", "locale");

-- CreateIndex
CREATE INDEX "ProductFamilyTranslation_locale_idx" ON "ProductFamilyTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetKey_key" ON "Asset"("assetKey");

-- CreateIndex
CREATE INDEX "Asset_kind_locale_idx" ON "Asset"("kind", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_productId_locale_key" ON "ProductTranslation"("productId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAsset_productId_assetId_role_key" ON "ProductAsset"("productId", "assetId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamilyAsset_familyId_assetId_role_key" ON "ProductFamilyAsset"("familyId", "assetId", "role");

-- CreateIndex
CREATE INDEX "ProductSourceSnapshot_productId_sourceType_idx" ON "ProductSourceSnapshot"("productId", "sourceType");

-- CreateIndex
CREATE INDEX "Product_familyId_idx" ON "Product"("familyId");

-- CreateIndex
CREATE INDEX "Product_typeCode_idx" ON "Product"("typeCode");

-- CreateIndex
CREATE INDEX "Product_seriesCode_idx" ON "Product"("seriesCode");

-- CreateIndex
CREATE INDEX "Product_publishStatus_isActive_idx" ON "Product"("publishStatus", "isActive");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFamilyTranslation" ADD CONSTRAINT "ProductFamilyTranslation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAsset" ADD CONSTRAINT "ProductAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFamilyAsset" ADD CONSTRAINT "ProductFamilyAsset_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFamilyAsset" ADD CONSTRAINT "ProductFamilyAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSourceSnapshot" ADD CONSTRAINT "ProductSourceSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
