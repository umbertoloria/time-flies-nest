import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../prisma.repository';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';

@Injectable()
export class TodoRepository {
  constructor(private readonly repo: PrismaRepository) {}

  public findTodosFromCalendars(calendarIds: number[]) {
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

  public readUndoneTodosByCalendar(calendarId: number, filterDate: string) {
    return this.repo.todo.findMany({
      where: {
        calendar_id: calendarId,
        date: filterDate,
        done_date: null,
      },
    });
  }

  public findTodo(calendarId: number, todoId: number) {
    return this.repo.todo.findUnique({
      where: {
        calendar_id: calendarId,
        id: todoId,
      },
    });
  }

  public countTodosFromCalendar(calendarId: number) {
    return this.repo.todo.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
  }

  public create(dto: CreateTodoDto) {
    return this.repo.todo.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        done_date: null,
        notes: dto.notes || undefined,
        // missed: undefined, // TODO: Deal with Legacy "missed" flag
      },
    });
  }

  public updateNotes(dto: UpdateTodoDto) {
    return this.repo.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        notes: dto.notes || null,
      },
    });
  }

  public updateDate(dto: MoveTodoDto) {
    return this.repo.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        date: dto.date,
      },
    });
  }

  public updateTodoDoneDate(
    todoId: number,
    doneDate: string,
    dto: UpdateDoneTodoDto,
  ) {
    return this.repo.todo.update({
      where: {
        id: todoId,
      },
      data: {
        done_date: doneDate,
        // TODO: To-do set as Done ambiguity: "notes" become NULL or kept?
        notes: dto.notes || undefined,
      },
    });
  }
}
