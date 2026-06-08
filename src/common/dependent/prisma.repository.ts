import {
  Calendar as PrismaCalendar,
  PrismaClient,
  Task as PrismaTask,
  Todo as PrismaTodo,
} from '@prisma/client';

export type Calendar = PrismaCalendar;
export type Task = PrismaTask;
export type Todo = PrismaTodo;

export const prisma = new PrismaClient();
