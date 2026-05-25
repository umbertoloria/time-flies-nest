import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';
import { UserLoginDto } from '../../modules/auth/dto';

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
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // User Auth validation
    const apiAuth = getApiAuth(request.body);
    if (!apiAuth) {
      return false;
    }
    const dto = UserLoginDto.fromApiAuth(apiAuth);

    // User Auth verification
    const dbUser = await this.authService.tryUserLogin(dto);
    if (!dbUser) {
      return false;
    }

    // Ok.
    request.currUser = {
      id: dbUser.id,
      email: dbUser.email,
    };
    return true;
  }
}

function getApiAuth(body: any) {
  const em = body?.em;
  const sp = body?.sp;
  if (!(typeof em === 'string' && !!em && typeof sp === 'string' && !!sp)) {
    return null;
  }
  return {
    em,
    sp,
  };
}
