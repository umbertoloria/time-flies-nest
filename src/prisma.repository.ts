import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Calendar as PrismaCalendar,
  Task as PrismaTask,
  Todo as PrismaTodo,
  PrismaClient,
} from 'generated/prisma';

export type Calendar = PrismaCalendar;
export type Task = PrismaTask;
export type Todo = PrismaTodo;

@Injectable()
export class PrismaRepository extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
