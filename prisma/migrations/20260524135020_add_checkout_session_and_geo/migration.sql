-- CreateEnum
CREATE TYPE "CheckoutSource" AS ENUM ('QR_PRESENCIAL', 'API_MARKETPLACE');

-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "SupplierProfile" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "serviceTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "entrepreneurId" TEXT,
    "amount" BIGINT NOT NULL,
    "items" JSONB NOT NULL,
    "prazo" INTEGER NOT NULL,
    "source" "CheckoutSource" NOT NULL DEFAULT 'QR_PRESENCIAL',
    "status" "CheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "orderId" TEXT,
    "marketplaceId" TEXT,
    "successUrl" TEXT,
    "webhookUrl" TEXT,
    "cancelUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_code_key" ON "CheckoutSession"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_orderId_key" ON "CheckoutSession"("orderId");

-- CreateIndex
CREATE INDEX "CheckoutSession_code_idx" ON "CheckoutSession"("code");

-- CreateIndex
CREATE INDEX "CheckoutSession_supplierId_status_idx" ON "CheckoutSession"("supplierId", "status");

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "EntrepreneurProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
