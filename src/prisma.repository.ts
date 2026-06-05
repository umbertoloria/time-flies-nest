import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Calendar as PrismaCalendar,
  Task as PrismaTask,
  PrismaClient,
} from 'generated/prisma';

export type Calendar = PrismaCalendar;
export type Task = PrismaTask;

@Injectable()
export class PrismaRepository extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
