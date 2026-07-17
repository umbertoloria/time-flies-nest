import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono';

const app = new Hono<HonoEnv>();

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
