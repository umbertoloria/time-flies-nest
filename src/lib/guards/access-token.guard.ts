import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JWTPayload } from 'jose';
import { extractBearerTokenFromHeaders } from '../../auth-middleware';
import { validateJwt } from '../../jwt-validator';

export const CurrentUser = createParamDecorator<unknown, ReqUser>(
  (_, context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const currUser = request.currUser;
    if (!currUser) {
      throw new ForbiddenException();
    }
    return currUser;
  },
);

/*
export type ReqUserParam<
  Prop extends keyof ReqUser | undefined = undefined,
> = Prop extends keyof ReqUser ? ReqUser[Prop] : ReqUser;
*/

@Injectable()
export class AccessTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      // @ts-ignore
      const token = extractBearerTokenFromHeaders(request.headers);
      const payload = await validateJwt(token);

      // Store auth info in request for generic use
      request.currUser = createReqUser(payload);

      return true;
    } catch (err: any) {
      if (err.status === 401) throw new UnauthorizedException(err.message);
      throw new ForbiddenException(err.message);
    }
  }
}

export function createReqUser(payload: JWTPayload): ReqUser {
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
