import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Calendar as PrismaCalendar,
  PrismaClient,
  Task as PrismaTask,
  Todo as PrismaTodo,
} from 'generated/prisma/client';

export type Calendar = PrismaCalendar;
export type Task = PrismaTask;
export type Todo = PrismaTodo;

export type ExtendedPrismaClient = PrismaClient;

let prisma: null | ExtendedPrismaClient = null;

export const getPrismaInstance = (databaseUrl: string) => {
  if (!prisma) {
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
};
