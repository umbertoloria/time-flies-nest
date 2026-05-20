import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaRepository } from '../../prisma.repository';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';

@Injectable()
export class TodoService {
  constructor(private readonly repo: PrismaRepository) {}

  readUndoneTodosByCalendars(calendarIds: number[]) {
    return this.repo.todo.findMany({
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
    return this.repo.todo.findMany({
      where: {
        calendar_id: calendarId,
        date: filterDate,
        done_date: null,
      },
    });
  }

  async readTodo(calendarId: number, todoId: number) {
    const todo = await this.repo.todo.findUnique({
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
    const result = await this.repo.todo.count({
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
    return await this.repo.todo.create({
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
    const upd = await this.repo.todo.update({
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

  async moveTodo(dto: MoveTodoDto) {
    const upd = await this.repo.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        date: dto.date,
      },
    });

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return upd;
  }

  async updateTodoSetAsDone(dto: UpdateDoneTodoDto) {
    const dbTodo = await this.readTodo(dto.calendarId, dto.todoId);
    // TODO: Verify calendar is user's

    const doneDate = dbTodo.date; // Always using the To-do Date as "default".

    const upd = await this.repo.todo.update({
      where: {
        id: dbTodo.id,
      },
      data: {
        done_date: doneDate,
        // TODO: To-do set as Done ambiguity: "notes" become NULL or kept?
        notes: dto.notes || undefined,
      },
    });

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return upd;
  }
}
