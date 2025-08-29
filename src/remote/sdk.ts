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
  };
};

export function getSDK(configService: ConfigService, bodyParams: any) {
  const { em, sp } = getApiAuth(bodyParams);
  const { phpBaseUrl, phpApiKey } = getFromConfigService(configService);
  return getSDKPure(phpBaseUrl, phpApiKey, em, sp);
}
