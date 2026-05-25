import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../prisma.repository';
import { UserLoginDto } from './dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly repo: PrismaRepository) {}

  public readUserFromCredentials(dto: UserLoginDto) {
    return this.repo.user.findFirst({
      where: {
        email: dto.email,
        password: dto.password,
      },
    });
  }
}
