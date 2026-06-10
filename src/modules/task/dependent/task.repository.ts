import { ExtendedPrismaClient } from '@dep/prisma';
import { CreateTaskDto, UpdateTaskDto } from '../core/dto';
import { TaskEntity } from '../core/entity';
import {
  entitiesFromTasks,
  entityFromTask,
  entityFromTaskOrNull,
} from './entity-mapper';

export class TaskRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  public async findTask(
    calendarId: number,
    taskId: number,
  ): Promise<TaskEntity | null> {
    const record = await this.prisma.task.findUnique({
      where: {
        id: taskId,
        calendar_id: calendarId,
      },
    });

    return entityFromTaskOrNull(record);
  }

  public async findTasksFromCalendarsAndDate(
    calendarIds: number[],
    dateFrom: string,
  ) {
    const records = await this.prisma.task.findMany({
      where: {
        calendar_id: {
          in: calendarIds,
        },
        date: {
          gte: dateFrom,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return entitiesFromTasks(records);
  }

  public async findTasksFromCalendar(
    calendarId: number,
  ): Promise<TaskEntity[]> {
    const records = await this.prisma.task.findMany({
      where: {
        calendar_id: calendarId,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return entitiesFromTasks(records);
  }

  public countTasksWithNotesFromCalendar(calendarId: number) {
    return this.prisma.task.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
  }

  public async findTaskFromCalendarAndDate(
    calendarId: number,
    date: string,
  ): Promise<TaskEntity[]> {
    const records = await this.prisma.task.findMany({
      where: {
        calendar_id: calendarId,
        date,
      },
    });

    return entitiesFromTasks(records);
  }

  public async create(dto: CreateTaskDto): Promise<TaskEntity> {
    const record = await this.prisma.task.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        notes: dto.notes || undefined,
      },
    });

    return entityFromTask(record);
  }

  public async update(dto: UpdateTaskDto): Promise<TaskEntity> {
    const record = await this.prisma.task.update({
      where: {
        id: dto.taskId,
        calendar_id: dto.calendarId,
      },
      data: {
        notes: dto.notes || null,
      },
    });

    return entityFromTask(record);
  }
}
