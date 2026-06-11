/*
import { Pool } from 'pg';
*/
import { neon } from '@neondatabase/serverless';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Calendar as PrismaCalendar,
  PrismaClient,
  Task as PrismaTask,
  Todo as PrismaTodo,
} from '@prismagen/prisma/client';

export type Calendar = PrismaCalendar;
export type Task = PrismaTask;
export type Todo = PrismaTodo;

export type ExtendedPrismaClient = PrismaClient;

let prisma: null | ExtendedPrismaClient = null;

export const getPrismaInstance = (databaseUrl: string) => {
  if (!prisma) {
    /*
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    */
    const connection = neon(databaseUrl);
    const adapter = new PrismaNeonHttp(connection);
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
};
