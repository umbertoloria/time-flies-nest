import { Injectable } from '@nestjs/common';
import { PrismaRepository, Task } from '../../prisma.repository';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TaskRepository {
  constructor(private readonly repo: PrismaRepository) {}

  public findTask(calendarId: number, taskId: number): Promise<Task | null> {
    return this.repo.task.findUnique({
      where: {
        id: taskId,
        calendar_id: calendarId,
      },
    });
  }

  public findTasksFromCalendarsAndDate(
    calendarIds: number[],
    dateFrom: string,
  ) {
    return this.repo.task.findMany({
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
  }

  public findTasksFromCalendar(calendarId: number): Promise<Task[]> {
    return this.repo.task.findMany({
      where: {
        calendar_id: calendarId,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  public countTasksWithNotesFromCalendar(calendarId: number) {
    return this.repo.task.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
  }

  public findTaskFromCalendarAndDate(
    calendarId: number,
    date: string,
  ): Promise<Task[]> {
    return this.repo.task.findMany({
      where: {
        calendar_id: calendarId,
        date,
      },
    });
  }

  public create(dto: CreateTaskDto): Promise<Task> {
    return this.repo.task.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        notes: dto.notes || undefined,
      },
    });
  }

  public update(dto: UpdateTaskDto): Promise<Task> {
    return this.repo.task.update({
      where: {
        id: dto.taskId,
        calendar_id: dto.calendarId,
      },
      data: {
        notes: dto.notes || null,
      },
    });
  }
}
