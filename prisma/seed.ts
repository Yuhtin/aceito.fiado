// Seed inicial pra demo.
//
// Cria 1 empreendedora (Joana — Onda Preta Biquínis), 3 fornecedores
// (Distribuidora Tropical, Atacado Afro Cosméticos, Brás Têxteis), catálogo
// de produtos, transações Pix históricas dos últimos 90 dias e algumas
// operações passadas + 1 ativa.
//
// Logins:
//   joana@ondapreta.com.br / aceito123
//   compras@distropical.com.br / aceito123
//   pedidos@afrocosmeticos.com.br / aceito123
//   atendimento@brastexteis.com.br / aceito123

import "dotenv/config";
import { hashPassword } from "../src/lib/password";
import { calculateScore, calculateCashflowStability } from "../src/lib/scoring";
import { calculatePricing, getInterestBpsForTerm, calcDueDate, getCaptureRateBpsForTerm } from "../src/lib/pricing";
import { nextDuplicataNumero, randomTxid } from "../src/lib/utils";
import { PrismaClient, ChannelType, SupplierCategory, OrderStatus, DuplicataStatus } from "../src/generated/prisma/client";

const db = new PrismaClient();

const PASSWORD = "aceito123";

const SUPPLIERS = [
  {
    email: "compras@distropical.com.br",
    name: "Tropical — equipe de pedidos",
    cnpj: "11.222.333/0001-44",
    businessName: "Distribuidora Tropical Brás",
    phone: "(11) 3333-1100",
    addressCep: "03003-000",
    addressCity: "São Paulo",
    addressState: "SP",
    addressNeighborhood: "Brás",
    category: SupplierCategory.TEXTIL,
    description:
      "Distribuidora de tecidos, aviamentos e linha praia no Brás desde 2008. Atende marcas independentes em todo o Brasil.",
    pixKey: "11222333000144",
    products: [
      {
        sku: "TEC-LYC-001",
        name: "Lycra com brilho — coleção verão",
        description: "Tecido lycra 90% poliamida com brilho metalizado. Largura 1,50m. Vendido por metro.",
        priceCents: 4200n,
        unit: "M",
        stock: 480,
        minQuantity: 5,
      },
      {
        sku: "TEC-LYC-002",
        name: "Lycra fosca microfibra",
        description: "Tecido fosco para biquíni e moda fitness. Toque macio, alta durabilidade. Largura 1,50m.",
        priceCents: 3400n,
        unit: "M",
        stock: 620,
        minQuantity: 5,
      },
      {
        sku: "AV-FIO-010",
        name: "Fio elástico colorido (rolo 50m)",
        description: "Fio elástico para acabamento. Disponível em 12 cores. Rolo com 50 metros.",
        priceCents: 1800n,
        unit: "UN",
        stock: 220,
      },
      {
        sku: "AV-ARG-005",
        name: "Argola de metal banhada (100un)",
        description: "Argolas niqueladas para biquíni e top. Pacote com 100 unidades.",
        priceCents: 4500n,
        unit: "PCT",
        stock: 95,
      },
      {
        sku: "AV-BOC-200",
        name: "Bojo triangular (par)",
        description: "Bojo triangular em espuma soft. Tamanho médio. Par.",
        priceCents: 750n,
        unit: "UN",
        stock: 1200,
      },
      {
        sku: "TEC-FOR-001",
        name: "Forro de biquíni siliconado",
        description: "Forro siliconado branco, 100% poliéster. Largura 1,60m.",
        priceCents: 1600n,
        unit: "M",
        stock: 380,
      },
    ],
  },
  {
    email: "pedidos@afrocosmeticos.com.br",
    name: "Afro Cosméticos — pedidos",
    cnpj: "22.333.444/0001-55",
    businessName: "Atacado Afro Cosméticos",
    phone: "(11) 2222-3344",
    addressCep: "02011-000",
    addressCity: "São Paulo",
    addressState: "SP",
    addressNeighborhood: "Santana",
    category: SupplierCategory.COSMETICOS,
    description:
      "Atacado especializado em cosméticos para cabelos crespos e cacheados. Curadoria de marcas pretas brasileiras.",
    pixKey: "22333444000155",
    products: [
      {
        sku: "COSM-MAC-300",
        name: "Manteiga de karité pura (300g)",
        description: "Manteiga 100% pura, sem refino. Embalagem de 300g.",
        priceCents: 2400n,
        unit: "UN",
        stock: 240,
      },
      {
        sku: "COSM-OLEO-100",
        name: "Óleo de coco extra-virgem (100ml)",
        description: "Óleo de coco prensado a frio. 100ml.",
        priceCents: 1800n,
        unit: "UN",
        stock: 500,
      },
      {
        sku: "COSM-CREM-500",
        name: "Creme de pentear sem enxágue (500ml)",
        description: "Linha cachos — fórmula vegana. 500ml.",
        priceCents: 2900n,
        unit: "UN",
        stock: 320,
      },
    ],
  },
  {
    email: "atendimento@brastexteis.com.br",
    name: "Brás Têxteis — atendimento",
    cnpj: "33.444.555/0001-66",
    businessName: "Brás Têxteis Estampas",
    phone: "(11) 3344-5566",
    addressCep: "03001-100",
    addressCity: "São Paulo",
    addressState: "SP",
    addressNeighborhood: "Brás",
    category: SupplierCategory.TEXTIL,
    description:
      "Tecidos estampados, com referências afrocentradas. Estampas exclusivas em parceria com designers.",
    pixKey: "33444555000166",
    products: [
      {
        sku: "TEC-EST-AFR1",
        name: "Tecido viscose estampa Ankara",
        description: "Estampa exclusiva inspirada em padrões Ankara. Largura 1,40m. Vendido por metro.",
        priceCents: 3800n,
        unit: "M",
        stock: 180,
        minQuantity: 3,
      },
      {
        sku: "TEC-EST-AFR2",
        name: "Tecido algodão estampa kente",
        description: "Algodão fino com estampa kente. Largura 1,40m.",
        priceCents: 4100n,
        unit: "M",
        stock: 140,
        minQuantity: 3,
      },
    ],
  },
];

const PAYER_NAMES = [
  "Mariana Souza",
  "Carla Pereira",
  "Juliana Ribeiro",
  "Renata Lima",
  "Fernanda Costa",
  "Patrícia Almeida",
  "Aline Martins",
  "Camila Rocha",
  "Vanessa Oliveira",
  "Beatriz Santos",
  "Larissa Silva",
  "Daniela Moura",
  "Isabela Cardoso",
  "Tatiana Vieira",
  "Sabrina Reis",
];

function randomCpf(): string {
  const d = Array.from({ length: 11 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function pseudoRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

async function main() {
  console.log("🌱 Limpando dados antigos...");
  await db.receivable.deleteMany();
  await db.pixTransaction.deleteMany();
  await db.duplicata.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.scoreSnapshot.deleteMany();
  await db.channel.deleteMany();
  await db.product.deleteMany();
  await db.entrepreneurProfile.deleteMany();
  await db.supplierProfile.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();

  console.log("👥 Criando fornecedores...");
  const suppliers = await Promise.all(
    SUPPLIERS.map(async (s) => {
      const user = await db.user.create({
        data: {
          email: s.email,
          passwordHash: hashPassword(PASSWORD),
          role: "SUPPLIER",
          name: s.name,
        },
      });
      const supplier = await db.supplierProfile.create({
        data: {
          userId: user.id,
          cnpj: s.cnpj,
          businessName: s.businessName,
          phone: s.phone,
          addressCep: s.addressCep,
          addressCity: s.addressCity,
          addressState: s.addressState,
          addressNeighborhood: s.addressNeighborhood,
          category: s.category,
          description: s.description,
          pixKey: s.pixKey,
        },
      });
      await db.product.createMany({
        data: s.products.map((p) => ({
          supplierId: supplier.id,
          sku: p.sku,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          unit: p.unit,
          stock: p.stock,
          minQuantity: ("minQuantity" in p ? p.minQuantity : undefined) ?? 1,
        })),
      });
      return supplier;
    }),
  );

  console.log("👩🏾‍💼 Criando empreendedora — Joana...");
  const joanaUser = await db.user.create({
    data: {
      email: "joana@ondapreta.com.br",
      passwordHash: hashPassword(PASSWORD),
      role: "ENTREPRENEUR",
      name: "Joana Bezerra",
    },
  });

  const joana = await db.entrepreneurProfile.create({
    data: {
      userId: joanaUser.id,
      cnpj: "44.555.666/0001-77",
      businessName: "Onda Preta Biquínis",
      phone: "(11) 98765-4321",
      addressCep: "04190-000",
      addressCity: "São Paulo",
      addressState: "SP",
      addressNeighborhood: "Heliópolis",
      businessSince: new Date(2022, 8, 15),
    },
  });

  console.log("📡 Conectando canais...");
  const channels = await Promise.all([
    db.channel.create({
      data: {
        entrepreneurId: joana.id,
        type: ChannelType.PIX,
        label: "Pix Sicoob (chave CNPJ)",
        monthlyRevenueCents: 1_850_000n,
      },
    }),
    db.channel.create({
      data: {
        entrepreneurId: joana.id,
        type: ChannelType.SHOPEE,
        label: "Loja Shopee — Onda Preta",
        monthlyRevenueCents: 1_400_000n,
      },
    }),
    db.channel.create({
      data: {
        entrepreneurId: joana.id,
        type: ChannelType.INSTAGRAM,
        label: "@ondapreta.bk (DM + checkout)",
        monthlyRevenueCents: 980_000n,
      },
    }),
    db.channel.create({
      data: {
        entrepreneurId: joana.id,
        type: ChannelType.FEIRA,
        label: "Feira Preta — circuito mensal",
        monthlyRevenueCents: 480_000n,
      },
    }),
  ]);

  console.log("💸 Gerando 90 dias de Pix histórico...");
  const rnd = pseudoRandom(42);
  const now = new Date();
  const pixTransactions: Array<{
    txid: string;
    valueCents: bigint;
    payerName: string;
    payerDocument: string;
    channelId: string;
    receivedAt: Date;
  }> = [];

  // Mistura entre canais: Pix tem mais transações, Shopee menos mas maiores, etc.
  const channelWeights = [
    { channel: channels[0], txPerDay: 4, avgCents: 14000 }, // Pix direto
    { channel: channels[1], txPerDay: 2.5, avgCents: 18000 }, // Shopee
    { channel: channels[2], txPerDay: 1.5, avgCents: 21000 }, // Instagram
    { channel: channels[3], txPerDay: 0.3, avgCents: 16000 }, // Feira (esporádico)
  ];

  for (let d = 89; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    // Mais vendas em fim-de-semana e em períodos de coleção (alta sazonalidade)
    const weekendBoost = day.getDay() === 0 || day.getDay() === 6 ? 1.4 : 1;
    const seasonBoost = d > 60 ? 0.7 : d > 30 ? 1.1 : 1.3;

    for (const { channel, txPerDay, avgCents } of channelWeights) {
      const todayTx = Math.max(
        0,
        Math.round(txPerDay * weekendBoost * seasonBoost + rnd() * 1.5 - 0.5),
      );
      for (let i = 0; i < todayTx; i++) {
        const t = new Date(day);
        t.setHours(8 + Math.floor(rnd() * 14), Math.floor(rnd() * 60));
        const value = Math.round(
          avgCents * (0.5 + rnd() * 1.3),
        );
        pixTransactions.push({
          txid: randomTxid(),
          valueCents: BigInt(value),
          payerName: PAYER_NAMES[Math.floor(rnd() * PAYER_NAMES.length)],
          payerDocument: randomCpf(),
          channelId: channel.id,
          receivedAt: t,
        });
      }
    }
  }

  await db.pixTransaction.createMany({
    data: pixTransactions.map((p) => ({
      entrepreneurId: joana.id,
      ...p,
    })),
  });

  console.log(`   → ${pixTransactions.length} transações Pix criadas`);

  console.log("🧮 Calculando score inicial...");
  // Agrupa por mês para estabilidade
  const monthlyTotals = new Map<string, bigint>();
  for (const tx of pixTransactions) {
    const key = `${tx.receivedAt.getFullYear()}-${tx.receivedAt.getMonth()}`;
    monthlyTotals.set(
      key,
      (monthlyTotals.get(key) ?? 0n) + tx.valueCents,
    );
  }
  const monthlyArr = [...monthlyTotals.values()];
  const medianRevenue =
    monthlyArr.length > 0
      ? monthlyArr.sort((a, b) =>
          a < b ? -1 : a > b ? 1 : 0,
        )[Math.floor(monthlyArr.length / 2)]
      : 0n;

  const stability = calculateCashflowStability(monthlyArr);
  const monthsActive = Math.round(
    (now.getTime() - joana.businessSince.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );

  const scoreResult = calculateScore({
    monthlyRevenueCents: medianRevenue,
    monthsActive,
    channelsCount: channels.length,
    cashflowStabilityScore: stability,
    supplierHistoryScore: 0, // ainda não tem histórico
  });

  await db.scoreSnapshot.create({
    data: {
      entrepreneurId: joana.id,
      score: scoreResult.score,
      approvedLimitCents: scoreResult.approvedLimitCents,
      rationale: scoreResult.rationale,
      inputsJson: {
        monthlyRevenueCents: medianRevenue.toString(),
        monthsActive,
        channelsCount: channels.length,
        cashflowStabilityScore: stability,
        supplierHistoryScore: 0,
        factors: scoreResult.factors.map((f) => ({
          ...f,
          rawValue: String(f.rawValue),
        })),
      },
    },
  });

  console.log(
    `   → Score: ${(scoreResult.score * 100).toFixed(0)}%, limite: R$ ${(
      Number(scoreResult.approvedLimitCents) / 100
    ).toLocaleString("pt-BR")}`,
  );

  console.log("📦 Criando operações de fiado...");

  // Operação 1 — quitada (60 dias atrás, vencida há 15 dias mas quitada)
  const tropicalSupplier = suppliers[0];
  const tropicalProducts = await db.product.findMany({
    where: { supplierId: tropicalSupplier.id },
    orderBy: { priceCents: "desc" },
  });

  const op1Items = [
    { product: tropicalProducts[0], qty: 25 }, // lycra brilho
    { product: tropicalProducts[2], qty: 4 }, // fio elástico
    { product: tropicalProducts[4], qty: 30 }, // bojo
  ];
  const op1Subtotal = op1Items.reduce(
    (acc, it) => acc + it.product.priceCents * BigInt(it.qty),
    0n,
  );
  const op1Pricing = calculatePricing({
    subtotalCents: op1Subtotal,
    supplierDiscountBps: 300,
    customerInterestBps: getInterestBpsForTerm(45),
    termDays: 45,
  });
  const op1RequestedAt = new Date(now);
  op1RequestedAt.setDate(op1RequestedAt.getDate() - 75);
  const op1FundedAt = new Date(op1RequestedAt);
  op1FundedAt.setHours(op1FundedAt.getHours() + 3);
  const op1DueDate = calcDueDate(op1FundedAt, 45);
  const op1RepaidAt = new Date(op1DueDate);
  op1RepaidAt.setDate(op1RepaidAt.getDate() - 2);

  const op1 = await db.order.create({
    data: {
      entrepreneurId: joana.id,
      supplierId: tropicalSupplier.id,
      status: OrderStatus.REPAID,
      subtotalCents: op1Pricing.subtotalCents,
      supplierDiscountBps: 300,
      supplierReceiveCents: op1Pricing.supplierReceiveCents,
      customerInterestBps: op1Pricing.customerInterestBps,
      customerPayCents: op1Pricing.customerPayCents,
      platformFeeCents: op1Pricing.platformFeeCents,
      termDays: 45,
      captureRateBps: getCaptureRateBpsForTerm(45),
      requestedAt: op1RequestedAt,
      confirmedAt: new Date(op1RequestedAt.getTime() + 60 * 60 * 1000),
      fundedAt: op1FundedAt,
      dueDate: op1DueDate,
      repaidAt: op1RepaidAt,
      items: {
        create: op1Items.map((it) => ({
          productId: it.product.id,
          quantity: it.qty,
          unitPriceCents: it.product.priceCents,
          totalCents: it.product.priceCents * BigInt(it.qty),
        })),
      },
    },
  });

  await db.duplicata.create({
    data: {
      orderId: op1.id,
      numero: nextDuplicataNumero(1001),
      valorCents: op1Pricing.customerPayCents,
      vencimento: op1DueDate,
      sacadoCnpj: joana.cnpj,
      sacadoNome: joana.businessName,
      sacadorCnpj: tropicalSupplier.cnpj,
      sacadorNome: tropicalSupplier.businessName,
      status: DuplicataStatus.LIQUIDATED,
      registradoraTxid: randomTxid("CERC"),
      issuedAt: op1FundedAt,
    },
  });

  // Captura simulada da operação 1: capturas durante os 45 dias até quitar
  const op1ActivePix = await db.pixTransaction.findMany({
    where: {
      entrepreneurId: joana.id,
      receivedAt: { gte: op1FundedAt, lte: op1RepaidAt },
    },
    orderBy: { receivedAt: "asc" },
    take: 80,
  });
  let captured1 = 0n;
  for (const tx of op1ActivePix) {
    if (captured1 >= op1Pricing.customerPayCents) break;
    const captureAmount =
      (tx.valueCents * BigInt(getCaptureRateBpsForTerm(45))) / 10000n;
    const apply =
      captured1 + captureAmount > op1Pricing.customerPayCents
        ? op1Pricing.customerPayCents - captured1
        : captureAmount;
    if (apply <= 0n) continue;
    await db.receivable.create({
      data: {
        orderId: op1.id,
        pixTransactionId: tx.id,
        amountCapturedCents: apply,
        capturedAt: tx.receivedAt,
      },
    });
    await db.pixTransaction.update({
      where: { id: tx.id },
      data: { captured: true, capturedAmountCents: apply },
    });
    captured1 += apply;
  }

  // Operação 2 — ATIVA (5 dias atrás, vence em 40 dias)
  // Pedido maior pra ter captura parcial, não 100%
  const op2Items = [
    { product: tropicalProducts[1], qty: 180 }, // lycra fosca
    { product: tropicalProducts[5], qty: 120 }, // forro
    { product: tropicalProducts[2], qty: 16 }, // fio elástico
    { product: tropicalProducts[3], qty: 4 }, // argolas
    { product: tropicalProducts[4], qty: 40 }, // bojo
  ];
  const op2Subtotal = op2Items.reduce(
    (acc, it) => acc + it.product.priceCents * BigInt(it.qty),
    0n,
  );
  const op2Pricing = calculatePricing({
    subtotalCents: op2Subtotal,
    supplierDiscountBps: 300,
    customerInterestBps: getInterestBpsForTerm(45),
    termDays: 45,
  });
  const op2RequestedAt = new Date(now);
  op2RequestedAt.setDate(op2RequestedAt.getDate() - 5);
  const op2FundedAt = new Date(op2RequestedAt);
  op2FundedAt.setHours(op2FundedAt.getHours() + 2);
  const op2DueDate = calcDueDate(op2FundedAt, 45);

  const op2 = await db.order.create({
    data: {
      entrepreneurId: joana.id,
      supplierId: tropicalSupplier.id,
      status: OrderStatus.ACTIVE,
      subtotalCents: op2Pricing.subtotalCents,
      supplierDiscountBps: 300,
      supplierReceiveCents: op2Pricing.supplierReceiveCents,
      customerInterestBps: op2Pricing.customerInterestBps,
      customerPayCents: op2Pricing.customerPayCents,
      platformFeeCents: op2Pricing.platformFeeCents,
      termDays: 45,
      captureRateBps: getCaptureRateBpsForTerm(45),
      requestedAt: op2RequestedAt,
      confirmedAt: new Date(op2RequestedAt.getTime() + 30 * 60 * 1000),
      fundedAt: op2FundedAt,
      dueDate: op2DueDate,
      items: {
        create: op2Items.map((it) => ({
          productId: it.product.id,
          quantity: it.qty,
          unitPriceCents: it.product.priceCents,
          totalCents: it.product.priceCents * BigInt(it.qty),
        })),
      },
    },
  });

  await db.duplicata.create({
    data: {
      orderId: op2.id,
      numero: nextDuplicataNumero(1002),
      valorCents: op2Pricing.customerPayCents,
      vencimento: op2DueDate,
      sacadoCnpj: joana.cnpj,
      sacadoNome: joana.businessName,
      sacadorCnpj: tropicalSupplier.cnpj,
      sacadorNome: tropicalSupplier.businessName,
      status: DuplicataStatus.REGISTERED,
      registradoraTxid: randomTxid("CERC"),
      issuedAt: op2FundedAt,
    },
  });

  // Captura parcial nos últimos 5 dias
  const op2ActivePix = await db.pixTransaction.findMany({
    where: {
      entrepreneurId: joana.id,
      receivedAt: { gte: op2FundedAt },
      captured: false,
    },
    orderBy: { receivedAt: "asc" },
  });
  let captured2 = 0n;
  for (const tx of op2ActivePix) {
    if (captured2 >= op2Pricing.customerPayCents) break;
    const captureAmount =
      (tx.valueCents * BigInt(getCaptureRateBpsForTerm(45))) / 10000n;
    const apply =
      captured2 + captureAmount > op2Pricing.customerPayCents
        ? op2Pricing.customerPayCents - captured2
        : captureAmount;
    if (apply <= 0n) continue;
    await db.receivable.create({
      data: {
        orderId: op2.id,
        pixTransactionId: tx.id,
        amountCapturedCents: apply,
        capturedAt: tx.receivedAt,
      },
    });
    await db.pixTransaction.update({
      where: { id: tx.id },
      data: { captured: true, capturedAmountCents: apply },
    });
    captured2 += apply;
  }

  console.log(
    `   → Operação 1 quitada: ${(Number(op1Pricing.customerPayCents) / 100).toLocaleString("pt-BR")}`,
  );
  console.log(
    `   → Operação 2 ativa: ${(Number(op2Pricing.customerPayCents) / 100).toLocaleString("pt-BR")} (já capturado ${(Number(captured2) / 100).toLocaleString("pt-BR")})`,
  );

  console.log("");
  console.log("✅ Seed concluído. Logins:");
  console.log("   joana@ondapreta.com.br / aceito123");
  for (const s of SUPPLIERS) {
    console.log(`   ${s.email} / aceito123`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
