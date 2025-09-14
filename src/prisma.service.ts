import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  userLogin(email: string, password: string) {
    return this.user.findFirst({
      where: {
        email,
        password,
      },
    });
  }
}
