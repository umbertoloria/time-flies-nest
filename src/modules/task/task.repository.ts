import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../prisma.repository';
import { CreateTaskDto, UpdateCalendarDateDto } from './dto';

@Injectable()
export class TaskRepository {
  constructor(private readonly repo: PrismaRepository) {}

  public findTasksFromCalendarsAndDate(
    dbCalendarIds: number[],
    dateFrom: string,
  ) {
    return this.repo.task.findMany({
      where: {
        calendar_id: {
          in: dbCalendarIds,
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

  public findTasksFromCalendar(calendarId: number) {
    return this.repo.task.findMany({
      where: {
        calendar_id: calendarId,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  public countTasksFromCalendar(calendarId: number) {
    return this.repo.task.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
  }

  public findTaskFromCalendarAndDate(calendarId: number, date: string) {
    return this.repo.task.findMany({
      where: {
        calendar_id: calendarId,
        date,
      },
    });
  }

  public create(dto: CreateTaskDto) {
    return this.repo.task.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        notes: dto.notes || undefined,
      },
    });
  }

  public update(taskId: number, dto: UpdateCalendarDateDto) {
    return this.repo.task.update({
      where: {
        id: taskId,
        calendar_id: dto.calendarId,
        date: dto.date,
      },
      data: {
        notes: dto.notes || null,
      },
    });
  }
}
