import { startHonoServer } from './dependent/hono/server.hono';

export const PORT = parseInt('' + process.env.PORT, 10);

export const corsAllowedOrigins =
  process.env.CORS_ORIGINS_WHITELIST?.split(',') || [];

startHonoServer(PORT);
