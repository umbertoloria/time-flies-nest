import { getSDK } from './remote/sdk';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { isFirstOne } from './lib/list';

@Injectable()
export class TaskService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async readTasksDatesFromCalendars(
    bodyParams: any,
    dateFrom: string,
    dbCalendarIds: number[],
  ) {
    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readCalendars({
      dateFrom,
      calendarIds: dbCalendarIds,
    });

    // Mapping
    return phpResponse.api_calendars.map((calendar) => ({
      calendarId: calendar.cid,
      dates: calendar.done_tasks
        .map((doneTask) => doneTask.date)
        .filter(isFirstOne),
    }));
  }

  async readTasksFromCalendar(bodyParams: any, calendarId: number) {
    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readCalendarByID(calendarId);
    if (phpResponse === 'unable' || typeof phpResponse !== 'object') {
      throw new InternalServerErrorException();
    }
    return phpResponse.api_calendar.done_tasks;
  }

  async areThereTasksWithNotes(bodyParams: any, calendarId: number) {
    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).updateCalendar(calendarId, {
      usesNotes: false,
    });
    if (
      !phpResponse ||
      typeof phpResponse !== 'object' ||
      !phpResponse?.response
    ) {
      throw new InternalServerErrorException('Err 1');
    }
    if (phpResponse.response === 'calendar-uses-notes-cannot-be-disabled') {
      return 'calendar-uses-notes-cannot-be-disabled';
    }
    if (phpResponse.response !== 'ok-update') {
      throw new InternalServerErrorException('Err 2');
    }
    return 'ok';
  }

  async readTasksFromCalendarAndDate(
    bodyParams: any,
    calendarId: number,
    date: string,
  ) {
    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readCalendarDate(calendarId, date);
    if (!phpResponse) {
      throw new InternalServerErrorException();
    }
    return phpResponse.doneTasks;
  }

  async createDoneTask(
    bodyParams: any,
    calendarId: number,
    data: {
      date: string;
      notes: string | undefined;
    },
  ) {
    // PHP API
    const response: any = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).createCalendarDate(calendarId, data.date, data.notes);
    if (response !== 'ok') {
      console.error('createCalendarDay: given', response, 'expected "ok"');
      throw new InternalServerErrorException();
    }
  }

  async updateTaskNotesByDate(
    bodyParams: any,
    calendarId: number,
    date: string,
    data: {
      notes: string | undefined;
    },
  ) {
    // PHP API
    const response: any = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).updateCalendarDateNotes(calendarId, date, data.notes);
    if (response !== 'ok') {
      console.error('createCalendarDay: given', response, 'expected "ok"');
      throw new InternalServerErrorException();
    }
  }
}
