import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { TAuthStatus } from '../../sdk/types';
import { AuthGuard, CurrentUser } from '../../guards/auth.guard';
import { ReadUserStatusDto, UserLoginDto } from '../../auth/dto';

@Controller('/auth')
export class AuthController {
  constructor(private service: UserService) {}

  @Post('/login')
  async authLogin(@Body() body: any): Promise<'ok-login'> {
    const dto = UserLoginDto.fromBody(body);

    // BL
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
