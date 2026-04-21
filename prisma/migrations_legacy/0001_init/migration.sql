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

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT,
    "strokeMm" DECIMAL(12,3),
    "energyPerCycleNm" DECIMAL(14,3),
    "energyPerHourNm" DECIMAL(14,3),
    "maxImpactForceN" DECIMAL(14,3),
    "maxThrustForceN" DECIMAL(14,3),
    "totalLengthMm" DECIMAL(12,3),
    "threadSize" TEXT,
    "photoUrl" TEXT,
    "rawDataJson" JSONB,
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
CREATE UNIQUE INDEX "Product_model_key" ON "Product"("model");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

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
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ScenarioFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionLog" ADD CONSTRAINT "SelectionLog_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

