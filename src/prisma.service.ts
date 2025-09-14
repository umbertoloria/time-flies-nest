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

  readCalendarIDsFromUserIdViaSortedPin(user_id: number, showAll: boolean) {
    return this.calendar.findMany({
      where: {
        user_id,
        ...(showAll
          ? {}
          : {
              sorted_pin: {
                not: null,
              },
            }),
      },
      orderBy: {
        sorted_pin: 'asc',
      },
    });
  }

  readCalendarByIDAndUser(calendar_id: number, user_id: number) {
    return this.calendar.findUnique({
      where: {
        id: calendar_id,
        user_id,
      },
    });
  }
}
