import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { getFromConfigService, requireAuth } from '../auth';
import { PrismaService } from '../prisma.service';

function makeFormData(args: Record<string, string | undefined>) {
  const formData = new FormData();
  for (const key in args) {
    const value = args[key];
    if (value !== undefined) {
      formData.set(key, value);
    }
  }
  return formData;
}

export const getSDKPure = (
  phpBaseUrl: string | undefined,
  apiKey: string | undefined,
  uid: number,
) => {
  const api = axios.create({
    baseURL: phpBaseUrl,
    headers: {
      // ContentType: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  // TODO: FormData required here
  return {
    // Calendar
    async readCalendars(filters: { dateFrom: string; calendarIds: number[] }) {
      type ResponseType = {
        api_calendars: {
          cid: number;
          done_tasks: {
            date: string;
          }[];
        }[];
      };
      return api
        .post(
          `?a=calendars-read&date-from=${filters.dateFrom}&cids=${filters.calendarIds.join(',')}`,
          makeFormData({
            uid: `${uid}`,
          }),
        )
        .then((response) => response.data as ResponseType);
    },

    async updateCalendar(
      calendarId: number,
      data: {
        usesNotes?: boolean;
      },
    ) {
      // TODO: Deprecated
      type ResponseType =
        | {
            response: 'calendar-uses-notes-cannot-be-disabled';
          }
        | {
            response: 'ok-update';
          };
      const formData = new FormData();
      formData.append('uid', `${uid}`);
      formData.append('cid', `${calendarId}`);
      if (typeof data.usesNotes === 'boolean') {
        formData.append('uses-notes', data.usesNotes ? 'true' : 'false');
      }
      return api
        .post('?a=calendar-update', formData)
        .then((response) => response.data as ResponseType);
    },

    async readCalendarByID(calendarId: number) {
      type ResponseType =
        | 'unable'
        | {
            api_calendar: {
              cid: number;
              done_tasks: {
                date: string;
                notes?: string;
              }[];
            };
          };
      return api
        .post(
          `?a=calendar-read&cid=${calendarId}`,
          makeFormData({
            uid: `${uid}`,
          }),
        )
        .then((response) => response.data as ResponseType);
    },

    // Calendar Date
    async readCalendarDate(calendarId: number, date: string) {
      type ResponseType = {
        api_calendar_id: number;
        date: string;
        doneTasks: {
          id: number;
          notes?: string;
        }[];
      };
      return api
        .post(
          `?a=calendar-date-read&cid=${calendarId}&date=${date}`,
          makeFormData({
            uid: `${uid}`,
          }),
        )
        .then((response) => response.data as ResponseType);
    },

    createCalendarDate(
      calendarId: number,
      date: string,
      notes: undefined | string,
    ) {
      const formData = new FormData();
      formData.append('uid', `${uid}`);
      formData.append('id', `${calendarId}`);
      formData.append('local-date', date);
      if (notes) {
        formData.append('notes', notes);
      }
      return api
        .post('?a=calendar-date-create', formData)
        .then((response) => response.data as object);
    },

    updateCalendarDateNotes(
      calendarId: number,
      date: string,
      notes: undefined | string,
    ) {
      const formData = new FormData();
      formData.append('uid', `${uid}`);
      formData.append('calendar-id', `${calendarId}`);
      formData.append('local-date', date);
      if (notes) {
        formData.append('notes', notes);
      }
      return api
        .post('?a=calendar-date-update-notes', formData)
        .then((response) => response.data as object);
    },
  };
};

export async function getSDK(
  prismaService: PrismaService,
  configService: ConfigService,
  bodyParams: any,
) {
  // Auth
  const dbUser = await requireAuth(prismaService, bodyParams);
  const uid = dbUser.id;

  // SDK
  const { phpBaseUrl, phpApiKey } = getFromConfigService(configService);
  return getSDKPure(phpBaseUrl, phpApiKey, uid);
}
