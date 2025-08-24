import axios from 'axios';

export const getSDK = (
  phpBaseUrl: string | undefined,
  apiKey: string | undefined,
) => {
  const api = axios.create({
    baseURL: phpBaseUrl,
    headers: {
      ContentType: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return {
    readCalendarByID: (calendarId: number) =>
      api
        .post(`?a=calendar-read&cid=${calendarId}`, {
          auth: apiKey || '',
        })
        .then((response) => response.data as object),
  };
};
