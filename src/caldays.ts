import { getSDK } from './remote/sdk';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CalDaysService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async getShortCalendarDays(
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
    const result: {
      // id: number;
      calendar_id: number;
      date: string;
    }[] = [];
    phpResponse.api_calendars.forEach((calendar) => {
      calendar.done_tasks.forEach((calendar_day) => {
        result.push({
          // id: calendar_day.id,
          calendar_id: calendar.cid,
          date: calendar_day.date,
        });
      });
    });

    return result;
  }

  async getFullCalendarDays(bodyParams: any, calendarId: number) {
    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readCalendarByID(calendarId);
    if (phpResponse === 'unable' || typeof phpResponse !== 'object') {
      throw new InternalServerErrorException();
    }
    return phpResponse.api_calendar.done_tasks;
  }

  async areThereCalendarDaysWithNotes(bodyParams: any, calendarId: number) {
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

  async getCalendarDaysOnDate(
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

  async createCalendarDay(
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

  async updateCalendarDayNotes(
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
