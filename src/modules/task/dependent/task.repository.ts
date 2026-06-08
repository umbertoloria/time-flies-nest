import { prisma, Task } from '../../../common/dependent/prisma.repository';
import { CreateTaskDto, UpdateTaskDto } from '../core/dto';

class TaskRepository {
  public findTask(calendarId: number, taskId: number): Promise<Task | null> {
    return prisma.task.findUnique({
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
    return prisma.task.findMany({
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
    return prisma.task.findMany({
      where: {
        calendar_id: calendarId,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  public countTasksWithNotesFromCalendar(calendarId: number) {
    return prisma.task.count({
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
    return prisma.task.findMany({
      where: {
        calendar_id: calendarId,
        date,
      },
    });
  }

  public create(dto: CreateTaskDto): Promise<Task> {
    return prisma.task.create({
      data: {
        calendar_id: dto.calendarId,
        date: dto.date,
        notes: dto.notes || undefined,
      },
    });
  }

  public update(dto: UpdateTaskDto): Promise<Task> {
    return prisma.task.update({
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

export const taskRepository = new TaskRepository();
