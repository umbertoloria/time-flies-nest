import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { extractBearerTokenFromHeaders } from '../auth-middleware';
import { createReqUser } from '../lib/guards/access-token.guard';
import { validateJwt } from '../jwt-validator';
import { HonoEnv } from './server.hono';

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const headers = c.req.header();

  try {
    const token = extractBearerTokenFromHeaders(headers);
    const payload = await validateJwt(token);

    const currUser = createReqUser(payload);

    c.set('user', currUser);

    await next();
  } catch (err: any) {
    if (err instanceof HTTPException) throw err;
    if (err.status === 401 || err.name === 'JWTExpired') {
      throw new HTTPException(401, { message: err.message || 'Unauthorized' });
    }
    throw new HTTPException(403, { message: err.message || 'Forbidden' });
  }
});
