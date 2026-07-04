import { createMiddleware } from 'hono/factory';
import { HonoEnv } from '@dep/hono';
import { getEnvConfig } from '../config';
import {
  cacheValidToken,
  getReqUserFromTokensCache,
  verifyJwtAndCreateReqUser,
} from '@core/auth';
import { HTTPException } from 'hono/http-exception';
import { UnauthorizedError } from '@core/errors';

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const headers = c.req.header();

  const config = getEnvConfig(c);

  try {
    const token = extractBearerTokenFromHeaders(headers.authorization);

    let reqUser = getReqUserFromTokensCache(token);

    if (!reqUser) {
      reqUser = await verifyJwtAndCreateReqUser(config, token);

      cacheValidToken(token, reqUser);
    }

    c.set('user', reqUser);

    await next();
  } catch (err: any) {
    if (err instanceof HTTPException) throw err;

    if (err instanceof UnauthorizedError) {
      throw new HTTPException(401, { message: err.message || 'Unauthorized' });
    }

    throw new HTTPException(500, { message: 'Internal Server Error' });
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
