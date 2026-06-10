import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { UnauthorizedError } from '../../core/errors';
import { verifyJwtAndCreateReqUser } from 'src/shared/dependent/auth/jwt-req-user.ts';
import { HonoEnv } from './server-hono';

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const headers = c.req.header();

  try {
    const token = extractBearerTokenFromHeaders(headers.authorization);

    const reqUser = await verifyJwtAndCreateReqUser(token);

    c.set('user', reqUser);

    await next();
  } catch (err: any) {
    if (err instanceof HTTPException) throw err;
    if (err.status === 401 || err.name === 'JWTExpired') {
      throw new HTTPException(401, { message: err.message || 'Unauthorized' });
    }
    throw new HTTPException(403, { message: err.message || 'Forbidden' });
  }
});

function extractBearerTokenFromHeaders(authorization?: string): string {
  const bearerPrefix = 'Bearer ';

  if (!authorization) {
    throw new UnauthorizedError('Authorization header is missing');
  }

  if (!authorization.startsWith(bearerPrefix)) {
    throw new UnauthorizedError(
      `Authorization header must start with "${bearerPrefix}"`,
    );
  }

  return authorization.slice(bearerPrefix.length);
}
