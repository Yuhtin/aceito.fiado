-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ENTREPRENEUR', 'SUPPLIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PIX', 'SHOPEE', 'MERCADO_LIVRE', 'INSTAGRAM', 'FEIRA', 'MAQUININHA', 'OUTRO');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SupplierCategory" AS ENUM ('TEXTIL', 'COSMETICOS', 'ALIMENTOS', 'BEBIDAS', 'PAPELARIA', 'ACESSORIOS', 'CALCADOS', 'BAZAR', 'OUTROS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_SUPPLIER', 'SUPPLIER_CONFIRMED', 'FUNDED', 'ACTIVE', 'REPAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DuplicataStatus" AS ENUM ('ISSUED', 'REGISTERED', 'LIQUIDATED', 'PROTESTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressCep" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "addressState" TEXT NOT NULL,
    "addressNeighborhood" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "businessSince" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntrepreneurProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressCep" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "addressState" TEXT NOT NULL,
    "addressNeighborhood" TEXT NOT NULL,
    "category" "SupplierCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT,
    "pixKey" TEXT NOT NULL,
    "defaultDiscountBps" INTEGER NOT NULL DEFAULT 300,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "entrepreneurId" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "label" TEXT NOT NULL,
    "monthlyRevenueCents" BIGINT NOT NULL DEFAULT 0,
    "status" "ChannelStatus" NOT NULL DEFAULT 'ACTIVE',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL,
    "entrepreneurId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "approvedLimitCents" BIGINT NOT NULL,
    "inputsJson" JSONB NOT NULL,
    "rationale" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" BIGINT NOT NULL,
    "unit" TEXT NOT NULL,
    "imageUrl" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "entrepreneurId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_SUPPLIER',
    "subtotalCents" BIGINT NOT NULL,
    "supplierDiscountBps" INTEGER NOT NULL,
    "supplierReceiveCents" BIGINT NOT NULL,
    "customerInterestBps" INTEGER NOT NULL,
    "customerPayCents" BIGINT NOT NULL,
    "termDays" INTEGER NOT NULL,
    "platformFeeCents" BIGINT NOT NULL,
    "captureRateBps" INTEGER NOT NULL DEFAULT 3000,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "fundedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "repaidAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" BIGINT NOT NULL,
    "totalCents" BIGINT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duplicata" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "valorCents" BIGINT NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "sacadoCnpj" TEXT NOT NULL,
    "sacadoNome" TEXT NOT NULL,
    "sacadorCnpj" TEXT NOT NULL,
    "sacadorNome" TEXT NOT NULL,
    "registradoraCode" TEXT NOT NULL DEFAULT 'CERC',
    "registradoraTxid" TEXT,
    "status" "DuplicataStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Duplicata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PixTransaction" (
    "id" TEXT NOT NULL,
    "entrepreneurId" TEXT NOT NULL,
    "channelId" TEXT,
    "valueCents" BIGINT NOT NULL,
    "payerName" TEXT NOT NULL,
    "payerDocument" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "captured" BOOLEAN NOT NULL DEFAULT false,
    "capturedAmountCents" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PixTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receivable" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pixTransactionId" TEXT NOT NULL,
    "amountCapturedCents" BIGINT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receivable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EntrepreneurProfile_userId_key" ON "EntrepreneurProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EntrepreneurProfile_cnpj_key" ON "EntrepreneurProfile"("cnpj");

-- CreateIndex
CREATE INDEX "EntrepreneurProfile_cnpj_idx" ON "EntrepreneurProfile"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProfile_userId_key" ON "SupplierProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProfile_cnpj_key" ON "SupplierProfile"("cnpj");

-- CreateIndex
CREATE INDEX "SupplierProfile_cnpj_idx" ON "SupplierProfile"("cnpj");

-- CreateIndex
CREATE INDEX "SupplierProfile_category_idx" ON "SupplierProfile"("category");

-- CreateIndex
CREATE INDEX "Channel_entrepreneurId_idx" ON "Channel"("entrepreneurId");

-- CreateIndex
CREATE INDEX "ScoreSnapshot_entrepreneurId_calculatedAt_idx" ON "ScoreSnapshot"("entrepreneurId", "calculatedAt");

-- CreateIndex
CREATE INDEX "Product_supplierId_idx" ON "Product"("supplierId");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Product_supplierId_sku_key" ON "Product"("supplierId", "sku");

-- CreateIndex
CREATE INDEX "Order_entrepreneurId_status_idx" ON "Order"("entrepreneurId", "status");

-- CreateIndex
CREATE INDEX "Order_supplierId_status_idx" ON "Order"("supplierId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Duplicata_orderId_key" ON "Duplicata"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Duplicata_numero_key" ON "Duplicata"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "PixTransaction_txid_key" ON "PixTransaction"("txid");

-- CreateIndex
CREATE INDEX "PixTransaction_entrepreneurId_receivedAt_idx" ON "PixTransaction"("entrepreneurId", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Receivable_pixTransactionId_key" ON "Receivable"("pixTransactionId");

-- CreateIndex
CREATE INDEX "Receivable_orderId_idx" ON "Receivable"("orderId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrepreneurProfile" ADD CONSTRAINT "EntrepreneurProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierProfile" ADD CONSTRAINT "SupplierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "EntrepreneurProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "EntrepreneurProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "EntrepreneurProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duplicata" ADD CONSTRAINT "Duplicata_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PixTransaction" ADD CONSTRAINT "PixTransaction_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "EntrepreneurProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PixTransaction" ADD CONSTRAINT "PixTransaction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receivable" ADD CONSTRAINT "Receivable_pixTransactionId_fkey" FOREIGN KEY ("pixTransactionId") REFERENCES "PixTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
