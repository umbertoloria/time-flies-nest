import { ITodoRepository } from '../core/itodo.repository';
import { ExtendedPrismaClient } from '@dep/prisma';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from '../core/dto';
import {
  entitiesFromTodos,
  entityFromTodo,
  entityFromTodoOrNull,
} from './entity-mapper';

export class TodoRepository implements ITodoRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async findTodosFromCalendars(calendarIds: number[]) {
    const records = await this.prisma.todo.findMany({
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

    return entitiesFromTodos(records);
  }

  async findUndoneTodosByCalendar(calendarId: number, filterDate: string) {
    const records = await this.prisma.todo.findMany({
      where: {
        calendar_id: calendarId,
        date: filterDate,
        done_date: null,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return entitiesFromTodos(records);
  }

  async findById(todoId: number) {
    const record = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    return entityFromTodoOrNull(record);
  }

  countTodosWithNotesFromCalendar(calendarId: number) {
    return this.prisma.todo.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
  }

  async create(dto: CreateTodoDto) {
    const record = await this.prisma.todo.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        done_date: null,
        notes: dto.notes || undefined,
        // missed: undefined, // TODO: Deal with Legacy "missed" flag
      },
    });

    return entityFromTodo(record);
  }

  async updateNotes(dto: UpdateTodoDto) {
    const record = await this.prisma.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        notes: dto.notes || null,
      },
    });

    return entityFromTodo(record);
  }

  async updateDate(dto: MoveTodoDto) {
    // FIXME: Returns also nulls or not?
    const record = await this.prisma.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        date: dto.date,
      },
    });

    return entityFromTodoOrNull(record);
  }

  async updateTodoDoneDate(
    todoId: number,
    doneDate: string,
    dto: UpdateDoneTodoDto,
  ) {
    const record = await this.prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        done_date: doneDate,
        // TODO: To-do set as Done ambiguity: "notes" become NULL or kept?
        notes: dto.notes || undefined,
      },
    });

    return entityFromTodo(record);
  }
}
