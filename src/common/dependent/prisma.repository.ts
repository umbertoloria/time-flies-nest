import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Calendar as PrismaCalendar,
  PrismaClient,
  Task as PrismaTask,
  Todo as PrismaTodo,
} from '../../generated/prisma/client';

export type Calendar = PrismaCalendar;
export type Task = PrismaTask;
export type Todo = PrismaTodo;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
