import { createRemoteJWKSet, JWTPayload, jwtVerify } from 'jose';
import { ForbiddenError } from '../../core/errors';
import { getConfigs } from '../configs';

const jwks = createRemoteJWKSet(new URL(getConfigs().jwtJwksUri));

export async function verifyJwtAndCreateReqUser(token: string) {
  const payload = await validateToken(token);

  verifyPayload(payload);

  return createReqUserFromJWT(payload);
}

async function validateToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: getConfigs().jwtIssuer,
  });

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
  if (!audiences.includes(getConfigs().jwtAudience)) {
    throw new ForbiddenError('Invalid audience');
  }

  /*
  // Check required scopes for global API resources
  const requiredScopes = ['api:read', 'api:write']; // Replace with your actual required scopes
  const scopes = (payload.scope as string)?.split(' ') ?? [];
  if (!requiredScopes.every((scope) => scopes.includes(scope))) {
    throw new ForbiddenError('Insufficient scope');
  }
  */
}

function createReqUserFromJWT(payload: JWTPayload): ReqUser {
  const scopes = (payload.scope as string)?.split(' ') ?? [];

  const audience = Array.isArray(payload.aud)
    ? payload.aud
    : payload.aud
      ? [payload.aud]
      : [];

  return {
    id: payload.sub!,
    sub: payload.sub!,
    clientId: payload.client_id as string,
    organizationId: payload.organization_id as string,
    scopes,
    audience,
  };
}
