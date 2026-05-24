-- AlterTable EntrepreneurProfile: campos pro motor de crédito
ALTER TABLE "EntrepreneurProfile"
  ADD COLUMN "cpf" TEXT,
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "declaredBusinessActivity" TEXT,
  ADD COLUMN "hasCadUnico" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "pluggyItemId" TEXT;

CREATE UNIQUE INDEX "EntrepreneurProfile_cpf_key" ON "EntrepreneurProfile"("cpf");

-- CreateTable CreditAnalysis: snapshot de cada análise do motor
CREATE TABLE "CreditAnalysis" (
  "id" TEXT NOT NULL,
  "entrepreneurId" TEXT NOT NULL,
  "engineVersion" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "riskLevel" TEXT NOT NULL,
  "confidenceLevel" TEXT NOT NULL,
  "recommendedLimitCents" BIGINT NOT NULL,
  "suggestedFeePercent" DOUBLE PRECISION NOT NULL,
  "scoreFinal" INTEGER NOT NULL,
  "usedOpenFinance" BOOLEAN NOT NULL DEFAULT false,
  "positiveFactors" TEXT[],
  "attentionFactors" TEXT[],
  "userExplanation" TEXT NOT NULL,
  "rawInputJson" JSONB NOT NULL,
  "rawResultJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreditAnalysis_entrepreneurId_createdAt_idx" ON "CreditAnalysis"("entrepreneurId", "createdAt");

ALTER TABLE "CreditAnalysis" ADD CONSTRAINT "CreditAnalysis_entrepreneurId_fkey"
  FOREIGN KEY ("entrepreneurId") REFERENCES "EntrepreneurProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
