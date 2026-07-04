import { ITodoRepository, TodoDate } from '@app/todo/itodo.repository';
import { ExtendedPrismaClient } from '@dep/prisma';
import { TraceMethod } from '@core/trace';
import { CacheMethod } from '@core/cache';
import {
  CreateTodoDto,
  MoveTodoDto,
  ReadTodosFromDateDto,
  UpdateDoneTodoDto,
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

  async findTodo(calendarId: number, todoId: number) {
    const record = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
        calendar_id: calendarId,
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
        notes: dto.fields.notes || null,
      },
    });

    return entityFromTodo(record);
  }

  async updateDate(dto: MoveTodoDto) {
    const record = await this.prisma.todo.update({
      where: {
        id: dto.todoId,
        calendar_id: dto.calendarId,
      },
      data: {
        date: dto.fields.date,
      },
    });

    return entityFromTodo(record);
  }

  async updateTodoDoneDate(dto: UpdateDoneTodoDto, doneDate: string) {
    const record = await this.prisma.todo.update({
      where: {
        id: dto.todoId,
      },
      data: {
        done_date: doneDate,
        // TODO: To-do set as Done ambiguity: "notes" become NULL or kept?
        notes: dto.fields.notes || undefined,
      },
    });

    return entityFromTodo(record);
  }
}
