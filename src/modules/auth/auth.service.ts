import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaRepository } from '../../prisma.repository';
import { UserLoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly repo: PrismaRepository) {}

  tryUserLogin(dto: UserLoginDto) {
    return this.repo.user.findFirst({
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
