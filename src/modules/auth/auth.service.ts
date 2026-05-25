import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { UserLoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  tryUserLogin(dto: UserLoginDto) {
    return this.repo.readUserFromCredentials(dto);
  }

  async userLogin(dto: UserLoginDto) {
    const dbUser = await this.tryUserLogin(dto);
    if (!dbUser) {
      throw new UnauthorizedException('No session found');
    }
    return dbUser;
  }
}
