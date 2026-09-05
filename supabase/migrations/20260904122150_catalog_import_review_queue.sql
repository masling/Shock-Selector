-- CreateTable
CREATE TABLE "ProductImportBatch" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceSha256" TEXT NOT NULL,
    "sourceProductsSha256" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'IMPORTING',
    "sourceRowCount" INTEGER NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "sourceMetaJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ProductImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImportCandidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batchId" UUID NOT NULL,
    "sourceModel" TEXT NOT NULL,
    "sourceKind" TEXT NOT NULL,
    "proposedAction" TEXT NOT NULL,
    "catalogStatus" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "selectorEligible" BOOLEAN NOT NULL DEFAULT false,
    "rowSha256" TEXT NOT NULL,
    "candidateData" JSONB NOT NULL,
    "sourceData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImportCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductImportBatch_sourceSha256_key" ON "ProductImportBatch"("sourceSha256");

-- CreateIndex
CREATE INDEX "ProductImportCandidate_batchId_proposedAction_idx" ON "ProductImportCandidate"("batchId", "proposedAction");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImportCandidate_batchId_sourceModel_key" ON "ProductImportCandidate"("batchId", "sourceModel");

-- AddForeignKey
ALTER TABLE "ProductImportCandidate" ADD CONSTRAINT "ProductImportCandidate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductImportBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Candidates remain drafts even if an import script is misconfigured.
ALTER TABLE public."ProductImportBatch" ADD CONSTRAINT "ProductImportBatch_state_check" CHECK (state IN ('IMPORTING', 'DRAFT'));
ALTER TABLE public."ProductImportCandidate" ADD CONSTRAINT "ProductImportCandidate_draft_only" CHECK ("catalogStatus" = 'DRAFT' AND NOT "selectorEligible" AND "candidateData" @> '{"catalogStatus":"DRAFT","selectorEligible":false,"executionAllowed":false,"implicitDeletesAllowed":false}'::jsonb);
ALTER TABLE public."ProductImportCandidate" ADD CONSTRAINT "ProductImportCandidate_model_check" CHECK ("candidateData" ? 'model' AND "candidateData"->>'model' = "sourceModel");
REVOKE ALL ON public."ProductImportBatch", public."ProductImportCandidate" FROM PUBLIC, anon, authenticated, service_role, vibro_runtime;
ALTER TABLE public."ProductImportBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductImportCandidate" ENABLE ROW LEVEL SECURITY;
