import 'dotenv/config';
import { IncomingHttpHeaders } from 'http';
import { UnauthorizedError } from './core/errors';

export const JWT_JWKS_URI = process.env.JWT_JWKS_URI!;
export const JWT_ISSUER = process.env.JWT_ISSUER!;
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE!;

export function extractBearerTokenFromHeaders({
  authorization,
}: IncomingHttpHeaders): string {
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
