import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../controllers/auth/user.service';
import { UserLoginDto } from '../auth/dto';

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
  constructor(
    //
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // User Auth validation
    const apiAuth = getApiAuth(request.body);
    if (!apiAuth) {
      return false;
    }
    const dto = UserLoginDto.fromApiAuth(apiAuth);

    // User Auth verification
    const dbUser = await this.userService.tryUserLogin(dto);
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

function getApiAuth(bodyParams: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const em = bodyParams?.em;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const sp = bodyParams?.sp;
  if (!(typeof em === 'string' && !!em && typeof sp === 'string' && !!sp)) {
    return null;
  }
  return {
    em,
    sp,
  };
}
