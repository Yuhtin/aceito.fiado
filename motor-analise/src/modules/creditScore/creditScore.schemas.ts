import { z } from 'zod';

const allowedAmounts = [200, 400, 600, 800] as const;

export const analyzeCreditScoreSchema = z.object({
  user: z.object({
    name: z.string().min(2),
    cpf: z.string().regex(/^\d{11}$/, 'CPF must contain 11 digits'),
    cnpj: z.string().regex(/^\d{14}$/, 'CNPJ must contain 14 digits'),
    birthDate: z.string().date(),
    declaredMonthlyRevenue: z.number().nonnegative(),
    declaredBusinessActivity: z.string().min(2),
    businessType: z.string().min(2),
    city: z.string().min(2),
    state: z.string().length(2),
    hasCadUnico: z.boolean().optional(),
    monthsOperating: z.number().int().nonnegative()
  }),
  creditRequest: z.object({
    requestedAmount: z.number().refine((value) => allowedAmounts.includes(value as (typeof allowedAmounts)[number]), {
      message: 'requestedAmount must be one of 200, 400, 600 or 800'
    }),
    requestedTermDays: z.number().int().min(1).max(60),
    supplierCategory: z.string().min(2),
    intendedUse: z.string().min(5)
  }),
  openFinance: z
    .object({
      provider: z.literal('pluggy').optional(),
      itemId: z.string().min(1).optional()
    })
    .optional()
});

export type AnalyzeCreditScoreRequest = z.infer<typeof analyzeCreditScoreSchema>;
