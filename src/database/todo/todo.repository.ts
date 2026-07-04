import { ITodoRepository, TodoDate } from '@app/todo/itodo.repository';
import { ExtendedPrismaClient, TodoUpdateInput } from '@dep/prisma';
import { TraceMethod } from '@core/trace';
import { CacheMethod, EvictCache } from '@core/cache';
import {
  CreateTodoDto,
  ReadTodosFromDateDto,
  SetTodoAsDoneDto,
  UpdateTodoDto,
} from '@app/todo/dto';
import {
  entitiesFromTodos,
  entityFromTodo,
  entityFromTodoOrNull,
} from './entity-mapper';

export class TodoRepository implements ITodoRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  @CacheMethod()
  @TraceMethod()
  async findUndoneTodosByCalendarIds(calendarIds: number[]) {
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

  @CacheMethod()
  @TraceMethod()
  async findUndoneTodosDatesByCalendarIds(calendarIds: number[]) {
    const records = await this.prisma.todo.findMany({
      where: {
        calendar_id: {
          in: calendarIds,
        },
        done_date: null,
      },
      select: {
        calendar_id: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return records.map<TodoDate>((record) => ({
      calendarId: record.calendar_id,
      date: record.date,
    }));
  }

  @CacheMethod()
  async findUndoneTodosByCalendar(dto: ReadTodosFromDateDto) {
    const records = await this.prisma.todo.findMany({
      where: {
        calendar_id: dto.calendarId,
        date: dto.date,
        done_date: null,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return entitiesFromTodos(records);
  }

  @CacheMethod()
  async findTodo(calendarId: number, todoId: number) {
    const record = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
        calendar_id: calendarId,
      },
    });

    return entityFromTodoOrNull(record);
  }

  @CacheMethod()
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

  @EvictCache()
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

  @EvictCache()
  async update(dto: UpdateTodoDto) {
    const data: TodoUpdateInput = {};
    if (dto.fields.date) {
      data.date = dto.fields.date;
    }
    if (dto.fields.notes !== undefined) {
      data.notes = dto.fields.notes;
    }

    const record = await this.prisma.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data,
    });

    return entityFromTodo(record);
  }

  @EvictCache()
  async setAsDone(dto: SetTodoAsDoneDto) {
    const record = await this.prisma.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
        done_date: null,
      },
      data: {
        done_date: dto.doneDate,
      },
    });

    return entityFromTodo(record);
  }
}
