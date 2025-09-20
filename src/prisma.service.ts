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

  createCalendar(
    userId: number,
    data: {
      name: string;
      color: string; // Es. "#115599"
      plannedColor: string; // Es. "#115599"
      usesNotes: boolean;
    },
  ) {
    return this.calendar.create({
      data: {
        name: data.name,
        color: data.color,
        planned_color: data.plannedColor,
        uses_notes: data.usesNotes,
        user_id: userId,
      },
    });
  }

  async calendar_there_are_some_notes_in_it(calendarId: number) {
    const result = await this.todo.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
    return result > 0;
  }

  async updateCalendar(
    calendarId: number,
    userId: number,
    data: {
      name: string;
      color: string; // Es. "#115599"
      plannedColor: string; // Es. "#115599"
      usesNotes: boolean;
    },
  ) {
    const dbCalendar = await this.readCalendarByIDAndUser(calendarId, userId);
    if (!dbCalendar) {
      return 'not-found';
    }
    return await this.calendar.update({
      where: {
        id: calendarId,
        user_id: userId,
      },
      data: {
        name: data.name,
        color: data.color,
        planned_color: data.plannedColor,
        uses_notes: data.usesNotes,
      },
    });
  }

  readUndoneTodosByCalendars(calendarIds: number[]) {
    return this.todo.findMany({
      where: {
        calendar_id: {
          in: calendarIds,
        },
        done_date: null,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  readUndoneTodosByCalendar(calendarId: number, filterDate: string) {
    return this.todo.findMany({
      where: {
        calendar_id: calendarId,
        date: filterDate,
        done_date: null,
      },
    });
  }

  readTodo(calendarId: number, todoId: number) {
    return this.todo.findUnique({
      where: {
        calendar_id: calendarId,
        id: todoId,
      },
    });
  }
}
