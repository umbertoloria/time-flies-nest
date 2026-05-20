import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTodoDto, UpdateTodoDto } from '../../todo/dto';

@Injectable()
export class TodoService {
  constructor(
    //
    private readonly prismaService: PrismaService,
  ) {}

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

  async readTodo(calendarId: number, todoId: number) {
    const todo = await this.prismaService.todo.findUnique({
      where: {
        calendar_id: calendarId,
        id: todoId,
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async areThereTodosWithNotes(calendarId: number) {
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

  async createTodo(dto: CreateTodoDto) {
    // TODO: Verify calendar is user's
    return await this.prismaService.todo.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        done_date: null,
        notes: dto.notes || undefined,
        // missed: undefined, // TODO: Deal with Legacy "missed" flag
      },
    });
  }

  async updateTodoNotes(dto: UpdateTodoDto) {
    const upd = await this.prismaService.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        notes: dto.notes || null,
      },
    });

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return upd;
  }

  async moveTodo(todoId: number, calendarId: number, date: string) {
    return await this.prismaService.todo.update({
      where: {
        id: todoId,
        calendar_id: calendarId,
      },
      data: {
        date,
      },
    });
  }

  async updateTaskSetAsDone(
    todoId: number,
    doneDate: string,
    notes: string | null,
  ) {
    return await this.prismaService.todo.update({
      where: {
        id: todoId,
      },
      data: {
        done_date: doneDate,
        // TODO: To-do set as Done ambiguity: "notes" become NULL or kept?
        notes: notes || undefined,
      },
    });
  }
}
