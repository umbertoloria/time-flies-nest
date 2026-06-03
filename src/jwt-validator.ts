import { createRemoteJWKSet, JWTPayload, jwtVerify } from 'jose';
import {
  JWT_AUDIENCE,
  AuthorizationError,
  JWT_ISSUER,
  JWT_JWKS_URI,
} from './auth-middleware.js';

const jwks = createRemoteJWKSet(new URL(JWT_JWKS_URI));

export async function validateJwt(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: JWT_ISSUER,
  });

  verifyPayload(payload);
  return payload;
}

function verifyPayload(payload: JWTPayload): void {
  // console.debug('JWT Payload');
  // console.debug(payload);

  // Check audience claim matches your API resource indicator
  const audiences = Array.isArray(payload.aud)
    ? payload.aud
    : payload.aud
      ? [payload.aud]
      : [];
  if (!audiences.includes(JWT_AUDIENCE)) {
    throw new AuthorizationError('Invalid audience');
  }

  /*
  // Check required scopes for global API resources
  const requiredScopes = ['api:read', 'api:write']; // Replace with your actual required scopes
  const scopes = (payload.scope as string)?.split(' ') ?? [];
  if (!requiredScopes.every((scope) => scopes.includes(scope))) {
    throw new AuthorizationError('Insufficient scope');
  }
  */
}
