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
CREATE TYPE "CatalogStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "SelectorStatus" AS ENUM ('NOT_APPLICABLE', 'READY', 'INCOMPLETE', 'CONFLICT');

-- CreateEnum
CREATE TYPE "SpecDataType" AS ENUM ('NUMBER', 'TEXT', 'RANGE', 'JSON');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PDF_ENGLISH', 'PDF_CHINESE_FULL_CATALOG', 'EXCEL_SELECTOR', 'MANUAL_SEED');

-- CreateEnum
CREATE TYPE "ConfidenceStatus" AS ENUM ('VERIFIED_BY_PDF_AND_EXCEL', 'PDF_CATALOG_ONLY', 'EXCEL_SELECTOR_ONLY', 'CONFLICT_NEEDS_REVIEW', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "ImportIssueSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

-- CreateTable
CREATE TABLE "ProductFamily" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "catalogStatus" "CatalogStatus" NOT NULL DEFAULT 'PUBLISHED',
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
    "workingPrinciple" TEXT,
    "constructionNotes" TEXT,
    "featureNotes" TEXT,
    "seoSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFamilyTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSeries" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "selectorEligible" BOOLEAN NOT NULL DEFAULT false,
    "selectorDefaultStatus" "SelectorStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "catalogStatus" "CatalogStatus" NOT NULL DEFAULT 'PUBLISHED',
    "overview" TEXT,
    "workingPrinciple" TEXT,
    "constructionNotes" TEXT,
    "materialNotes" TEXT,
    "applicationNotes" TEXT,
    "featureNotes" TEXT,
    "sourceSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductModel" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "rawModel" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sortKey" TEXT NOT NULL,
    "catalogStatus" "CatalogStatus" NOT NULL DEFAULT 'PUBLISHED',
    "selectorStatus" "SelectorStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "selectorEligible" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "primaryImageUrl" TEXT,
    "rawDataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpecDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelZh" TEXT NOT NULL,
    "unit" TEXT,
    "dataType" "SpecDataType" NOT NULL,
    "familyId" TEXT,
    "seriesId" TEXT,
    "filterable" BOOLEAN NOT NULL DEFAULT false,
    "comparable" BOOLEAN NOT NULL DEFAULT false,
    "requiredForSelector" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSpecDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpecValue" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "specDefinitionId" TEXT NOT NULL,
    "valueNumber" DECIMAL(18,6),
    "valueText" TEXT,
    "valueJson" JSONB,
    "rawValue" TEXT,
    "sourceRefId" TEXT,
    "confidenceStatus" "ConfidenceStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',

    CONSTRAINT "ProductSpecValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSourceReference" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT,
    "modelId" TEXT,
    "sourceType" "SourceType" NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "sectionTitle" TEXT,
    "rawText" TEXT,
    "extractionMethod" TEXT NOT NULL,
    "confidenceStatus" "ConfidenceStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',

    CONSTRAINT "ProductSourceReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportIssue" (
    "id" TEXT NOT NULL,
    "severity" "ImportIssueSeverity" NOT NULL,
    "issueType" TEXT NOT NULL,
    "modelId" TEXT,
    "seriesId" TEXT,
    "specKey" TEXT,
    "message" TEXT NOT NULL,
    "sourceRefs" JSONB,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportIssue_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "ProductFamily_catalogStatus_idx" ON "ProductFamily"("catalogStatus");

-- CreateIndex
CREATE INDEX "ProductFamilyTranslation_locale_idx" ON "ProductFamilyTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFamilyTranslation_familyId_locale_key" ON "ProductFamilyTranslation"("familyId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSeries_slug_key" ON "ProductSeries"("slug");

-- CreateIndex
CREATE INDEX "ProductSeries_familyId_sortOrder_idx" ON "ProductSeries"("familyId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductSeries_selectorEligible_catalogStatus_idx" ON "ProductSeries"("selectorEligible", "catalogStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSeries_familyId_code_key" ON "ProductSeries"("familyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProductModel_model_key" ON "ProductModel"("model");

-- CreateIndex
CREATE INDEX "ProductModel_seriesId_sortKey_idx" ON "ProductModel"("seriesId", "sortKey");

-- CreateIndex
CREATE INDEX "ProductModel_catalogStatus_isActive_idx" ON "ProductModel"("catalogStatus", "isActive");

-- CreateIndex
CREATE INDEX "ProductModel_selectorEligible_selectorStatus_idx" ON "ProductModel"("selectorEligible", "selectorStatus");

-- CreateIndex
CREATE INDEX "ProductModel_model_idx" ON "ProductModel"("model");

-- CreateIndex
CREATE INDEX "ProductSpecDefinition_familyId_sortOrder_idx" ON "ProductSpecDefinition"("familyId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductSpecDefinition_seriesId_sortOrder_idx" ON "ProductSpecDefinition"("seriesId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductSpecDefinition_filterable_idx" ON "ProductSpecDefinition"("filterable");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecDefinition_key_familyId_seriesId_key" ON "ProductSpecDefinition"("key", "familyId", "seriesId");

-- CreateIndex
CREATE INDEX "ProductSpecValue_specDefinitionId_valueNumber_idx" ON "ProductSpecValue"("specDefinitionId", "valueNumber");

-- CreateIndex
CREATE INDEX "ProductSpecValue_confidenceStatus_idx" ON "ProductSpecValue"("confidenceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecValue_modelId_specDefinitionId_key" ON "ProductSpecValue"("modelId", "specDefinitionId");

-- CreateIndex
CREATE INDEX "ProductSourceReference_seriesId_sourceType_idx" ON "ProductSourceReference"("seriesId", "sourceType");

-- CreateIndex
CREATE INDEX "ProductSourceReference_modelId_sourceType_idx" ON "ProductSourceReference"("modelId", "sourceType");

-- CreateIndex
CREATE INDEX "ProductSourceReference_sourceType_pageNumber_idx" ON "ProductSourceReference"("sourceType", "pageNumber");

-- CreateIndex
CREATE INDEX "ImportIssue_severity_issueType_idx" ON "ImportIssue"("severity", "issueType");

-- CreateIndex
CREATE INDEX "ImportIssue_modelId_idx" ON "ImportIssue"("modelId");

-- CreateIndex
CREATE INDEX "ImportIssue_seriesId_idx" ON "ImportIssue"("seriesId");

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
ALTER TABLE "ProductSeries" ADD CONSTRAINT "ProductSeries_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductModel" ADD CONSTRAINT "ProductModel_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ProductSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecDefinition" ADD CONSTRAINT "ProductSpecDefinition_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecDefinition" ADD CONSTRAINT "ProductSpecDefinition_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ProductSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProductModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_specDefinitionId_fkey" FOREIGN KEY ("specDefinitionId") REFERENCES "ProductSpecDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecValue" ADD CONSTRAINT "ProductSpecValue_sourceRefId_fkey" FOREIGN KEY ("sourceRefId") REFERENCES "ProductSourceReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSourceReference" ADD CONSTRAINT "ProductSourceReference_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ProductSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSourceReference" ADD CONSTRAINT "ProductSourceReference_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProductModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportIssue" ADD CONSTRAINT "ImportIssue_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProductModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportIssue" ADD CONSTRAINT "ImportIssue_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "ProductSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ScenarioFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionLog" ADD CONSTRAINT "SelectionLog_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
