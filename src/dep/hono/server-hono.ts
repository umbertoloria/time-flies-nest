import { Env, Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { ExtendedPrismaClient } from '@dep/prisma';
import { getEnvConfig } from './config';
import { authMiddleware } from './middleware/auth.middleware';
import { prismaMiddleware } from './middleware/prisma.middleware';
import {
  AppContext,
  appContextMiddleware,
} from './middleware/app-context.middleware';
import { getHttpErrorName, getKoResponse } from './errors-mapper';

export type HonoEnv = Env & {
  Bindings: {
    CORS_ORIGINS_WHITELIST: string;
    JWT_JWKS_URI: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    DATABASE_URL: string;
  };
  Variables: {
    user: ReqUser;
    prisma: ExtendedPrismaClient;
    ctx: AppContext;
  };
};

export function createHonoServer(mapError2StatusCode: Map<Function, number>) {
  const app = new Hono<HonoEnv>();

  app.use('*', (c, next) => {
    return cors({
      origin: getEnvConfig(c).corsAllowedOrigins,
      allowHeaders: ['Content-Type', 'Authorization'],
      // allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowMethods: ['GET', 'POST'],
      credentials: true,
    })(c, next);
  });

  app.use('*', authMiddleware);
  app.use('*', prismaMiddleware);
  app.use('*', appContextMiddleware);

  app.onError((err, c) => {
    console.error(`Hono Error: ${err.message}`);

    const koResponse = getKoResponse(mapError2StatusCode, err, c);
    if (koResponse) {
      return koResponse;
    }

    if (err instanceof HTTPException) {
      return c.json(
        {
          statusCode: err.status,
          error: getHttpErrorName(err.status),
          message: err.message,
        },
        err.status,
      );
    }

    if (err instanceof ZodError) {
      return c.json(
        {
          statusCode: 400,
          error: getHttpErrorName(400),
          message: JSON.parse(err.message),
        },
        400,
      );
    }

    return c.json(
      {
        statusCode: 500,
        error: 'Internal Server Error',
        message: err.message,
      },
      500,
    );
  });

  return app;
}
