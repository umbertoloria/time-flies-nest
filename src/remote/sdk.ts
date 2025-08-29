import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { getApiAuth, getFromConfigService } from '../auth';

export const getSDKPure = (
  phpBaseUrl: string | undefined,
  apiKey: string | undefined,
  // Just for now. Pwd is cyphered.
  em: string,
  sp: string,
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
    authLogin(email: string, password: string) {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      return api
        .post('?a=login', formData)
        .then((response) => response.data as object);
    },
    readAuthStatus() {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
      return api
        .post('?a=status', formData)
        .then((response) => response.data as object);
    },
    readStreamline() {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
      return api
        .post('?a=planned-event-read', formData)
        .then((response) => response.data as object);
    },
    readCalendars(filters: { dateFrom: string; seeAllCalendars: boolean }) {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
      return api
        .post(
          `?a=calendars-read&date-from=${filters.dateFrom}${filters.seeAllCalendars ? '&show-all=true' : ''}`,
          formData,
        )
        .then((response) => response.data as object);
    },
    createCalendar(data: {
      name: string;
      color: string; // Es. "#115599"
      plannedColor: string; // Es. "#115599"
      usesNotes: boolean;
    }) {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
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
      formData.append('em', em);
      formData.append('sp', sp);
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
    readCalendarByID(calendarId: number) {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
      return api
        .post(`?a=calendar-read&cid=${calendarId}`, formData)
        .then((response) => response.data as object);
    },
    readCalendarDate(calendarId: number, date: string) {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
      return api
        .post(`?a=calendar-date-read&cid=${calendarId}&date=${date}`, formData)
        .then((response) => response.data as object);
    },
    createCalendarDate(
      calendarId: number,
      date: string,
      notes: undefined | string,
    ) {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
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
      formData.append('em', em);
      formData.append('sp', sp);
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
      formData.append('em', em);
      formData.append('sp', sp);
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
      formData.append('em', em);
      formData.append('sp', sp);
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
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
      formData.append('cid', `${calendarId}`);
      formData.append('eid', `${todoId}`);
      formData.append('date', date);
      return api
        .post('?a=planned-event-move', formData)
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
      formData.append('em', em);
      formData.append('sp', sp);
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

export function getSDK(configService: ConfigService, bodyParams: any) {
  const { em, sp } = getApiAuth(bodyParams);
  const { phpBaseUrl, phpApiKey } = getFromConfigService(configService);
  return getSDKPure(phpBaseUrl, phpApiKey, em, sp);
}
