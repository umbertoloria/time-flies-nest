import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TodoService {
  constructor(
    //
    private readonly prismaService: PrismaService,
  ) {}

  async calendar_there_are_some_notes_in_its_todos(calendarId: number) {
    const result = await this.prismaService.todo.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
    return result > 0;
  }

  readUndoneTodosByCalendars(calendarIds: number[]) {
    return this.prismaService.todo.findMany({
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
    return this.prismaService.todo.findMany({
      where: {
        calendar_id: calendarId,
        date: filterDate,
        done_date: null,
      },
    });
  }

  readTodo(calendarId: number, todoId: number) {
    return this.prismaService.todo.findUnique({
      where: {
        calendar_id: calendarId,
        id: todoId,
      },
    });
  }
}
