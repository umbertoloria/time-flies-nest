import { ITaskRepository, TaskDate } from '@app/task/itask.repository';
import { ExtendedPrismaClient } from '@dep/prisma';
import { TraceMethod } from '@core/trace';
import {
  CreateTaskDto,
  ReadTasksFromDateDto,
  UpdateTaskDto,
} from '@app/task/dto';
import { TaskEntity } from '@app/task/entity';
import {
  entitiesFromTasks,
  entityFromTask,
  entityFromTaskOrNull,
} from './entity-mapper';

export class TaskRepository implements ITaskRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  async findTask(
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

  @TraceMethod()
  async findTasksByCalendarIdsAndDate(calendarIds: number[], dateFrom: string) {
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

  @TraceMethod()
  async findTasksDatesByCalendarIdsAndDate(
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
      select: {
        calendar_id: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return records.map<TaskDate>((record) => ({
      calendarId: record.calendar_id,
      date: record.date,
    }));
  }

  async findTasksFromCalendar(calendarId: number) {
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

  countTasksWithNotesFromCalendar(calendarId: number) {
    return this.prisma.task.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
  }

  async findTaskFromCalendarAndDate(dto: ReadTasksFromDateDto) {
    const records = await this.prisma.task.findMany({
      where: {
        calendar_id: dto.calendarId,
        date: dto.date,
      },
    });

    return entitiesFromTasks(records);
  }

  async create(dto: CreateTaskDto) {
    const record = await this.prisma.task.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        notes: dto.notes || undefined,
      },
    });

    return entityFromTask(record);
  }

  async update(dto: UpdateTaskDto) {
    const record = await this.prisma.task.update({
      where: {
        id: dto.taskId,
        calendar_id: dto.calendarId,
      },
      data: {
        notes: dto.fields.notes || null,
      },
    });

    return entityFromTask(record);
  }
}
