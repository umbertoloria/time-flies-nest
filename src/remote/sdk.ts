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
    readCalendarByID(calendarId: number) {
      const formData = new FormData();
      formData.append('em', em);
      formData.append('sp', sp);
      return api
        .post(`?a=calendar-read&cid=${calendarId}`, formData)
        .then((response) => response.data as object);
    },
  };
};

export function getSDK(configService: ConfigService, bodyParams: any) {
  const { em, sp } = getApiAuth(bodyParams);
  const { phpBaseUrl, phpApiKey } = getFromConfigService(configService);
  return getSDKPure(phpBaseUrl, phpApiKey, em, sp);
}
