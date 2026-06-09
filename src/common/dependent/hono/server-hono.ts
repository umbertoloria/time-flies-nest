import { Env, Hono } from 'hono';
import { cors } from 'hono/cors';
import { ExtendedPrismaClient } from '../prisma.repository.ts';
import { getConfigs } from '../configs';
import { authMiddleware } from './auth.middleware';
import { prismaMiddleware } from '../db/prisma.middleware.ts';
import {
  appContextMiddleware,
  AppContext,
} from '@shared/dependent/hono/app-context.middleware.ts';

export type HonoEnv = Env & {
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    user: ReqUser;
    prisma: ExtendedPrismaClient;
    ctx: AppContext;
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
  app.use('*', prismaMiddleware);
  app.use('*', appContextMiddleware);

  return app;
}
