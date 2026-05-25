import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TAuthStatus } from '../../sdk/types';
import { AuthGuard, CurrentUser } from '../../lib/guards/auth.guard';
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

  @UseGuards(AuthGuard)
  @Post('/status')
  authStatus(@CurrentUser() user: ReqUser) {
    const dto = ReadUserStatusDto.fromBody(user);

    // Response
    const response: TAuthStatus = {
      user: {
        id: dto.user.id,
        email: dto.user.email,
      },
    };
    return JSON.stringify(response);
  }
}
