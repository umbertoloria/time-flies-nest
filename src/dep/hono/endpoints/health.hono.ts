import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono';
import { prismaMiddleware } from '@dep/hono/middleware/prisma.middleware';

const app = new Hono<HonoEnv>();

app.use('*', prismaMiddleware);

app.get('/health', (c) => {
  return c.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'I am alive!',
    },
    200,
  );
});

export const healthApp = app;
