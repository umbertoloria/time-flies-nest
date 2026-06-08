import { IncomingHttpHeaders } from 'http';

import 'dotenv/config';

export const JWT_JWKS_URI = process.env.JWT_JWKS_URI!;
export const JWT_ISSUER = process.env.JWT_ISSUER!;
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE!;

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public status = 403,
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export function extractBearerTokenFromHeaders({
  authorization,
}: IncomingHttpHeaders): string {
  const bearerPrefix = 'Bearer ';

  if (!authorization) {
    throw new AuthorizationError('Authorization header is missing', 401);
  }

  if (!authorization.startsWith(bearerPrefix)) {
    throw new AuthorizationError(
      `Authorization header must start with "${bearerPrefix}"`,
      401,
    );
  }

  return authorization.slice(bearerPrefix.length);
}
