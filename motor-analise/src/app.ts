import express from 'express';
import { creditScoreRouter } from './modules/creditScore/creditScore.controller.js';
import { pluggyRouter } from './modules/pluggy/pluggy.controller.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/credit-score', creditScoreRouter);
  app.use('/api', pluggyRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    res.status(500).json({ error: 'INTERNAL_ERROR', message });
  });

  return app;
}
