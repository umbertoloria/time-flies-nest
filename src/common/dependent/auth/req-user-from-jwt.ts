import { JWTPayload } from 'jose';

export function createReqUserFromJWT(payload: JWTPayload): ReqUser {
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
