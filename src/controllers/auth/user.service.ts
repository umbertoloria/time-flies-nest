import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserLoginDto } from '../../auth/dto';

@Injectable()
export class UserService {
  constructor(
    //
    private readonly prismaService: PrismaService,
  ) {}

  userLogin(dto: UserLoginDto) {
    return this.prismaService.user.findFirst({
      where: {
        email: dto.email,
        password: dto.password,
      },
    });
  }
}
