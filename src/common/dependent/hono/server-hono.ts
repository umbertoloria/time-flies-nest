import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '../../core/errors';
import { getConfigs } from '../configs';
import { authMiddleware } from './auth.middleware';
import { getHttpErrorName, getKoResponse } from './errors-handler';

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

  const mapError2StatusCode = new Map<Function, number>([
    [BadRequestError, 400],
    [UnauthorizedError, 401],
    [ForbiddenError, 403],
  ]);
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
