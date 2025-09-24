import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class UserService {
  constructor(
    //
    private readonly prismaService: PrismaService,
  ) {}

  userLogin(email: string, password: string) {
    return this.prismaService.user.findFirst({
      where: {
        email,
        password,
      },
    });
  }
}
