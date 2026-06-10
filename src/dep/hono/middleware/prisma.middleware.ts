import { createMiddleware } from 'hono/factory';
import { HonoEnv } from '@dep/hono';
import { getEnvConfig } from '../config';
import { getPrismaInstance } from '@dep/prisma';

export const prismaMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const config = getEnvConfig(c);

  const dbUrl = config.dbUrl;
  if (!dbUrl) {
    return c.json(
      {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Data not available',
      },
      500,
    );
  }

  const prismaInstance = getPrismaInstance(dbUrl);

  c.set('prisma', prismaInstance);

  await next();
});
