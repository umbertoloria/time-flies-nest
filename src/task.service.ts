import { PrismaService } from './prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { isFirstOne } from './lib/list';

@Injectable()
export class TaskService {
  constructor(private prismaService: PrismaService) {}

  async readTasksDatesFromCalendars(dateFrom: string, dbCalendarIds: number[]) {
    const response = await this.prismaService.task.findMany({
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
    return dbCalendarIds.map((calendarId) => ({
      calendarId,
      dates: response
        .filter((task) => task.calendar_id === calendarId)
        .map((task) => task.date)
        .filter(isFirstOne),
    }));
  }

  async readTasksFromCalendar(calendarId: number) {
    const response = await this.prismaService.task.findMany({
      where: {
        calendar_id: calendarId,
      },
      orderBy: {
        date: 'asc',
      },
    });
    return response.map((task) => ({
      id: task.id,
      calendar: task.calendar_id,
      date: task.date,
      notes: task.notes || undefined,
    }));
  }

  async areThereTasksWithNotes(calendarId: number) {
    const response = await this.prismaService.task.count({
      where: {
        calendar_id: calendarId,
        NOT: {
          notes: null,
        },
      },
    });
    return response > 0 ? 'calendar-uses-notes-cannot-be-disabled' : 'ok';
  }

  async readTasksFromCalendarAndDate(calendarId: number, date: string) {
    const response = await this.prismaService.task.findMany({
      where: {
        calendar_id: calendarId,
        date,
      },
    });
    // TODO: Returning multiple Tasks for the same Day
    return response.map((task) => ({
      id: task.id,
      notes: task.notes || undefined,
    }));
  }

  async createDoneTask(
    calendarId: number,
    data: {
      date: string;
      notes: string | undefined;
    },
  ) {
    return await this.prismaService.task.create({
      data: {
        calendar_id: calendarId,
        date: data.date,
        notes: data.notes || undefined,
      },
    });
  }

  async updateTaskNotesByDate(
    calendarId: number,
    date: string,
    data: {
      notes: string | undefined;
    },
  ) {
    // FIXME: Bug if there are multiple Tasks for the same Date
    const tasks = await this.readTasksFromCalendarAndDate(calendarId, date);
    if (!tasks.length) {
      throw new NotFoundException('Task not found');
    }
    if (tasks.length > 1) {
      throw new NotFoundException('Task not found');
    }
    const taskId = tasks[0].id;
    return await this.prismaService.task.update({
      where: {
        id: taskId,
        calendar_id: calendarId,
        date,
      },
      data: {
        notes: data.notes || null,
      },
    });
  }
}
