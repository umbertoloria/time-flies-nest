import {
  Calendar as PrismaCalendar,
  PrismaClient,
  Task as PrismaTask,
  Todo as PrismaTodo,
} from 'generated/prisma';

export type Calendar = PrismaCalendar;
export type Task = PrismaTask;
export type Todo = PrismaTodo;

class PrismaRepository extends PrismaClient {}

export const prisma = new PrismaRepository();
