import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getConfigs } from '../configs';
import { authMiddleware } from './auth.middleware';

export type HonoEnv = {
  Variables: {
    user: ReqUser;
  };
};

export function createHonoServer() {
  const app = new Hono<HonoEnv>();

  app.use(
    '*',
    cors({
      origin: getConfigs().corsAllowedOrigins,
      allowHeaders: ['Content-Type', 'Authorization'],
      // allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowMethods: ['GET', 'POST'],
      credentials: true,
    }),
  );

  app.use('*', authMiddleware);

  return app;
}
