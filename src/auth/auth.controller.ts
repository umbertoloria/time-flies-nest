import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { get_required_string } from '../lib/validate';
import { TAuthStatus } from '../remote/types';
import { AuthGuard, CurrentUser } from '../guards/auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(
    //
    private prismaService: PrismaService,
  ) {}

  @Post('/login')
  async authLogin(@Body() bodyParams: any): Promise<'ok-login'> {
    // Validation
    const email = get_required_string(bodyParams, 'email');
    const password = get_required_string(bodyParams, 'password');

    // BL
    const dbUser = await this.prismaService.userLogin(email, password);
    if (!dbUser) {
      throw new UnauthorizedException('No session found');
    }
    return 'ok-login';
  }

  @UseGuards(AuthGuard)
  @Post('/status')
  authStatus(@CurrentUser() user: ReqUser) {
    // Response
    const response: TAuthStatus = {
      user: {
        id: user.id,
        email: user.email,
      },
    };
    return JSON.stringify(response);
  }
}
