import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserLoginDto } from '../../auth/dto';

@Injectable()
export class UserService {
  constructor(
    //
    private readonly prismaService: PrismaService,
  ) {}

  tryUserLogin(dto: UserLoginDto) {
    return this.prismaService.user.findFirst({
      where: {
        email: dto.email,
        password: dto.password,
      },
    });
  }

  async userLogin(dto: UserLoginDto) {
    const dbUser = await this.tryUserLogin(dto);
    if (!dbUser) {
      throw new UnauthorizedException('No session found');
    }
    return dbUser;
  }
}
