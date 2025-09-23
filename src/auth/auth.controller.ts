import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { get_required_string } from '../lib/validate';
import { requireAuth } from '../auth';
import { TAuthStatus } from '../remote/types';

@Controller('/auth')
export class AuthController {
  constructor(
    //
    private prismaService: PrismaService,
  ) {}

  // TODO: Improve Auth mechanism

  @Post('/login')
  async authLogin(@Body() bodyParams: any): Promise<string> {
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

  @Post('/status')
  async authStatus(@Body() bodyParams: any): Promise<string> {
    // Auth
    const dbUser = await requireAuth(this.prismaService, bodyParams);

    // Response
    const response: TAuthStatus = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
      },
    };
    return JSON.stringify(response);
  }
}
