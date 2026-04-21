-- CreateEnum
CREATE TYPE "MotionKind" AS ENUM ('LINEAR', 'ROTARY');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('HORIZONTAL', 'VERTICAL', 'SLOPE');

-- CreateEnum
CREATE TYPE "DriveType" AS ENUM ('FREE', 'FORCE', 'MOTOR', 'CYLINDER');

-- CreateEnum
CREATE TYPE "LoadType" AS ENUM ('OBJECT', 'LOAD', 'BEAM_OR_GATE', 'TABLE');

-- CreateEnum
CREATE TYPE "GravityRelation" AS ENUM ('NONE', 'ASSISTING', 'OPPOSING');

-- CreateEnum
CREATE TYPE "ViewMode" AS ENUM ('ENGINEER', 'BUYER');

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

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "familyId" TEXT,
    "model" TEXT NOT NULL,
    "type" TEXT,
    "legacyTypeLabel" TEXT,
    "typeCode" "ProductTypeCode",
    "seriesCode" TEXT,
    "strokeMm" DECIMAL(12,3),
    "energyPerCycleNm" DECIMAL(14,3),
    "energyPerHourNm" DECIMAL(14,3),
    "maxImpactForceN" DECIMAL(14,3),
    "maxThrustForceN" DECIMAL(14,3),
    "totalLengthMm" DECIMAL(12,3),
    "threadSize" TEXT,
    "photoUrl" TEXT,
    "sourceProductPhotoRef" TEXT,
    "rawDataJson" JSONB,
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioFamily" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "motionKind" "MotionKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "guideQuestions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "excelSheetName" TEXT,
    "motionKind" "MotionKind" NOT NULL,
    "orientation" "Orientation" NOT NULL,
    "driveType" "DriveType" NOT NULL,
    "loadType" "LoadType",
    "gravityRelation" "GravityRelation" NOT NULL DEFAULT 'NONE',
    "inputSchemaJson" JSONB NOT NULL,
    "outputSchemaJson" JSONB,
    "formulaMetaJson" JSONB,
    "uiHintsJson" JSONB,
    "isImplemented" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionLog" (
    "id" TEXT NOT NULL,
    "viewMode" "ViewMode" NOT NULL,
    "familyKey" TEXT,
    "scenarioKey" TEXT,
    "scenarioId" TEXT,
    "rawInputJson" JSONB NOT NULL,
    "normalizedInputJson" JSONB,
    "calculationJson" JSONB,
    "filterJson" JSONB,
    "matchedProductCount" INTEGER NOT NULL DEFAULT 0,
    "selectedProductIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamily_key_key" ON "ProductFamily"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamily_slug_key" ON "ProductFamily"("slug");

-- CreateIndex
CREATE INDEX "ProductFamily_isActive_sortOrder_idx" ON "ProductFamily"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductFamilyTranslation_locale_idx" ON "ProductFamilyTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamilyTranslation_familyId_locale_key" ON "ProductFamilyTranslation"("familyId", "locale");

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
CREATE UNIQUE INDEX "Product_model_key" ON "Product"("model");

-- CreateIndex
CREATE INDEX "Product_familyId_idx" ON "Product"("familyId");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_typeCode_idx" ON "Product"("typeCode");

-- CreateIndex
CREATE INDEX "Product_seriesCode_idx" ON "Product"("seriesCode");

-- CreateIndex
CREATE INDEX "Product_strokeMm_idx" ON "Product"("strokeMm");

-- CreateIndex
CREATE INDEX "Product_energyPerCycleNm_idx" ON "Product"("energyPerCycleNm");

-- CreateIndex
CREATE INDEX "Product_energyPerHourNm_idx" ON "Product"("energyPerHourNm");

-- CreateIndex
CREATE INDEX "Product_maxImpactForceN_idx" ON "Product"("maxImpactForceN");

-- CreateIndex
CREATE INDEX "Product_maxThrustForceN_idx" ON "Product"("maxThrustForceN");

-- CreateIndex
CREATE INDEX "Product_threadSize_idx" ON "Product"("threadSize");

-- CreateIndex
CREATE INDEX "Product_publishStatus_isActive_idx" ON "Product"("publishStatus", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioFamily_key_key" ON "ScenarioFamily"("key");

-- CreateIndex
CREATE INDEX "ScenarioFamily_motionKind_isActive_idx" ON "ScenarioFamily"("motionKind", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_key_key" ON "Scenario"("key");

-- CreateIndex
CREATE INDEX "Scenario_familyId_isActive_idx" ON "Scenario"("familyId", "isActive");

-- CreateIndex
CREATE INDEX "Scenario_motionKind_orientation_driveType_idx" ON "Scenario"("motionKind", "orientation", "driveType");

-- CreateIndex
CREATE INDEX "SelectionLog_viewMode_createdAt_idx" ON "SelectionLog"("viewMode", "createdAt");

-- CreateIndex
CREATE INDEX "SelectionLog_familyKey_idx" ON "SelectionLog"("familyKey");

-- CreateIndex
CREATE INDEX "SelectionLog_scenarioKey_idx" ON "SelectionLog"("scenarioKey");

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

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ScenarioFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionLog" ADD CONSTRAINT "SelectionLog_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
