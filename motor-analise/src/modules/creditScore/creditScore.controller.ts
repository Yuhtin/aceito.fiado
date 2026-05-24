import { Router } from 'express';
import { CreditScoreService } from './creditScore.service.js';
import { analyzeCreditScoreSchema } from './creditScore.schemas.js';

export const creditScoreRouter = Router();

creditScoreRouter.post('/analyze', async (req, res) => {
  const parsed = analyzeCreditScoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', details: parsed.error.flatten() });
  }

  const service = new CreditScoreService();
  const result = await service.analyze(parsed.data);
  return res.json(result);
});
