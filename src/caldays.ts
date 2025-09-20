import { getSDK } from './remote/sdk';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

export async function getShortCalendarDays(
  prismaService: PrismaService,
  configService: ConfigService,
  bodyParams: any,
  dateFrom: string,
  dbCalendarIds: number[],
) {
  // PHP API
  const phpResponse = await (
    await getSDK(prismaService, configService, bodyParams)
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

export async function getFullCalendarDays(
  prismaService: PrismaService,
  configService: ConfigService,
  bodyParams: any,
  calendarId: number,
) {
  // PHP API
  const phpResponse = await (
    await getSDK(prismaService, configService, bodyParams)
  ).readCalendarByID(calendarId);
  if (phpResponse === 'unable' || typeof phpResponse !== 'object') {
    throw new InternalServerErrorException();
  }
  return phpResponse.api_calendar.done_tasks;
}

export async function areThereCalendarDaysWithNotes(
  prismaService: PrismaService,
  configService: ConfigService,
  bodyParams: any,
  calendarId: number,
) {
  // PHP API
  const phpResponse = await (
    await getSDK(prismaService, configService, bodyParams)
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

export async function getCalendarDaysOnDate(
  prismaService: PrismaService,
  configService: ConfigService,
  bodyParams: any,
  calendarId: number,
  date: string,
) {
  // PHP API
  const phpResponse = await (
    await getSDK(prismaService, configService, bodyParams)
  ).readCalendarDate(calendarId, date);
  if (!phpResponse) {
    throw new InternalServerErrorException();
  }
  return phpResponse.doneTasks;
}

export async function createCalendarDay(
  prismaService: PrismaService,
  configService: ConfigService,
  bodyParams: any,
  calendarId: number,
  data: {
    date: string;
    notes: string | undefined;
  },
) {
  // PHP API
  const response: any = await (
    await getSDK(prismaService, configService, bodyParams)
  ).createCalendarDate(calendarId, data.date, data.notes);
  if (response !== 'ok') {
    console.error('createCalendarDay: given', response, 'expected "ok"');
    throw new InternalServerErrorException();
  }
}

export async function updateCalendarDayNotes(
  prismaService: PrismaService,
  configService: ConfigService,
  bodyParams: any,
  calendarId: number,
  date: string,
  data: {
    notes: string | undefined;
  },
) {
  const response: any = await (
    await getSDK(prismaService, configService, bodyParams)
  ).updateCalendarDateNotes(calendarId, date, data.notes);
  if (response !== 'ok') {
    console.error('createCalendarDay: given', response, 'expected "ok"');
    throw new InternalServerErrorException();
  }
}
