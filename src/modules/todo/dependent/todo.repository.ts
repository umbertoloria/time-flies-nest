import { ExtendedPrismaClient, Todo } from '@shared/dependent/prisma';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from '../core/dto';

export class TodoRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  public findTodosFromCalendars(calendarIds: number[]): Promise<Todo[]> {
    return this.prisma.todo.findMany({
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

  public findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<Todo[]> {
    return this.prisma.todo.findMany({
      where: {
        calendar_id: calendarId,
        date: filterDate,
        done_date: null,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  public findById(todoId: number): Promise<Todo | null> {
    return this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });
  }

  public countTodosWithNotesFromCalendar(calendarId: number) {
    return this.prisma.todo.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
  }

  public create(dto: CreateTodoDto): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        done_date: null,
        notes: dto.notes || undefined,
        // missed: undefined, // TODO: Deal with Legacy "missed" flag
      },
    });
  }

  public updateNotes(dto: UpdateTodoDto): Promise<Todo> {
    return this.prisma.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        notes: dto.notes || null,
      },
    });
  }

  public updateDate(dto: MoveTodoDto): Promise<Todo> {
    // FIXME: Returns also nulls or not?
    return this.prisma.todo.update({
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
  ): Promise<Todo> {
    return this.prisma.todo.update({
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
