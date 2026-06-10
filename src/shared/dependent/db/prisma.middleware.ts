import { createMiddleware } from 'hono/factory';
import { HonoEnv } from '../hono/server-hono.ts';
import { getPrisma } from '../prisma.repository.ts';

export const prismaMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const dbUrl = c.env?.DATABASE_URL || process.env.DATABASE_URL;
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

  const prismaInstance = getPrisma(dbUrl);

  c.set('prisma', prismaInstance);

  await next();
});
