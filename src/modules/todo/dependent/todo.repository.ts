import { ExtendedPrismaClient } from '@dep/prisma';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from '../core/dto';
import { TodoEntity } from '../core/entity';
import {
  entitiesFromTodos,
  entityFromTodo,
  entityFromTodoOrNull,
} from './entity-mapper';

export class TodoRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  public async findTodosFromCalendars(
    calendarIds: number[],
  ): Promise<TodoEntity[]> {
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

  public async findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<TodoEntity[]> {
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

  public async findById(todoId: number): Promise<TodoEntity | null> {
    const record = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    return entityFromTodoOrNull(record);
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

  public async create(dto: CreateTodoDto): Promise<TodoEntity> {
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

  public async updateNotes(dto: UpdateTodoDto): Promise<TodoEntity> {
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

  public async updateDate(dto: MoveTodoDto): Promise<TodoEntity | null> {
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

  public async updateTodoDoneDate(
    todoId: number,
    doneDate: string,
    dto: UpdateDoneTodoDto,
  ): Promise<TodoEntity> {
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
