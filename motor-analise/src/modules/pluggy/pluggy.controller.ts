import { Router } from 'express';
import { z } from 'zod';
import { PluggyService } from './pluggy.service.js';

const connectTokenSchema = z.object({
  clientUserId: z.string().min(1).optional()
});

export const pluggyRouter = Router();

pluggyRouter.post('/connect-token', async (req, res) => {
  const parsed = connectTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD', details: parsed.error.flatten() });
  }

  try {
    const pluggy = new PluggyService();
    const connectToken = await pluggy.createConnectToken(parsed.data.clientUserId);
    return res.json({ accessToken: connectToken.accessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create Pluggy connect token';
    return res.status(503).json({ error: 'PLUGGY_UNAVAILABLE', message });
  }
});
