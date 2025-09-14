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
    async readStreamline(calendarIds: number[]) {
      type ResponseType = {
        dates: {
          date: string;
          calendars: {
            api_calendar_id: number;
            todos: {
              id: number;
              notes?: string;
            }[];
          }[];
        }[];
      };
      return api
        .post(
          `?a=planned-event-read&cids=${calendarIds.join(',')}`,
          makeFormData({
            uid: `${uid}`,
          }),
        )
        .then((response) => response.data as ResponseType);
    },
    async readCalendars(filters: { dateFrom: string; calendarIds: number[] }) {
      type ResponseType = {
        api_calendars: {
          cid: number;
          done_tasks: {
            date: string;
          }[];
          todos: {
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
    createCalendar(data: {
      name: string;
      color: string; // Es. "#115599"
      plannedColor: string; // Es. "#115599"
      usesNotes: boolean;
    }) {
      const formData = new FormData();
      formData.append('uid', `${uid}`);
      formData.append('name', data.name);
      formData.append('color', data.color);
      formData.append('planned-color', data.plannedColor);
      formData.append('uses-notes', data.usesNotes ? 'true' : 'false');
      return api
        .post(`?a=calendar-create`, formData)
        .then((response) => response.data as object);
    },
    updateCalendar(
      calendarId: number,
      data: {
        name?: string;
        color?: string; // Es. "#115599"
        plannedColor?: string; // Es. "#115599"
        usesNotes?: boolean;
      },
    ) {
      const formData = new FormData();
      formData.append('uid', `${uid}`);
      formData.append('cid', `${calendarId}`);
      if (data.name) {
        formData.append('name', data.name);
      }
      if (data.color) {
        formData.append('color', data.color);
      }
      if (data.plannedColor) {
        formData.append('planned-color', data.plannedColor);
      }
      if (typeof data.usesNotes === 'boolean') {
        formData.append('uses-notes', data.usesNotes ? 'true' : 'false');
      }
      return api
        .post('?a=calendar-update', formData)
        .then((response) => response.data as object);
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
              todos: {
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
    async readCalendarDate(calendarId: number, date: string) {
      type ResponseType = {
        api_calendar_id: number;
        date: string;
        doneTasks: {
          id: number;
          notes?: string;
        }[];
        todos: {
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
    createPlannedEvent(
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
        .post('?a=planned-event-create', formData)
        .then((response) => response.data as object);
    },
    updatePlannedEvent(
      calendarId: number,
      todoId: number,
      notes: undefined | string,
    ) {
      const formData = new FormData();
      formData.append('uid', `${uid}`);
      formData.append('cid', `${calendarId}`);
      formData.append('eid', `${todoId}`);
      if (notes) {
        formData.append('notes', notes);
      }
      return api
        .post('?a=planned-event-update-notes', formData)
        .then((response) => response.data as object);
    },
    movePlannedEvent(calendarId: number, todoId: number, date: string) {
      return api
        .post(
          '?a=planned-event-move',
          makeFormData({
            uid: `${uid}`,
            cid: `${calendarId}`,
            eid: `${todoId}`,
            date,
          }),
        )
        .then((response) => response.data as object);
    },
    setPlannedEventAsDone(
      calendarId: number,
      todoId: number,
      mode:
        | {
            type: 'done';
            notes: undefined | string;
          }
        | {
            type: 'missed';
          },
    ) {
      const formData = new FormData();
      formData.append('uid', `${uid}`);
      formData.append('calendar_id', `${calendarId}`);
      formData.append('event_id', `${todoId}`);
      if (mode.type === 'done') {
        if (typeof mode.notes === 'string') {
          formData.append('notes', mode.notes);
        }
      } else if (mode.type === 'missed') {
        formData.append('set_as_missed', 'true');
      }
      return api
        .post('?a=planned-event-set-as-done', formData)
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
