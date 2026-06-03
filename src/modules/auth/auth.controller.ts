import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TAuthStatus } from '../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import { ReadUserStatusDto, UserLoginDto } from './dto';

@Controller('/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('/login')
  async authLogin(@Body() body: any): Promise<'ok-login'> {
    const dto = UserLoginDto.fromBody(body);

    await this.service.userLogin(dto);

    return 'ok-login';
  }

  @UseGuards(AccessTokenGuard)
  @Post('/status')
  authStatus(@CurrentUser() user: ReqUser) {
    const dto = ReadUserStatusDto.fromBody(user);

    // Response
    const response: TAuthStatus = {
      user: {
        id: dto.user.id,
        email: 'dto.user.email', // FIXME: Deprecate all of this...
      },
    };
    return JSON.stringify(response);
  }
}
