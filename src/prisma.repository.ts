import { Injectable, OnModuleInit } from '@nestjs/common';
import { Calendar as PrismaCalendar, PrismaClient } from 'generated/prisma';

export type Calendar = PrismaCalendar;

@Injectable()
export class PrismaRepository extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
