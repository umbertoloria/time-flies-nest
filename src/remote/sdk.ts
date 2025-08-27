import axios from 'axios';

export const getSDK = (
  phpBaseUrl: string | undefined,
  apiKey: string | undefined,
  // Just for now. Pwd is cyphered.
  em: string,
  sp: string,
) => {
  const api = axios.create({
    baseURL: phpBaseUrl,
    headers: {
      ContentType: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return {
    readCalendarByID(calendarId: number) {
      // TODO: FormData required for now
      const formData = new FormData();
      formData.set('em', em);
      formData.set('sp', sp);
      return api
        .post(`?a=calendar-read&cid=${calendarId}`, formData)
        .then((response) => response.data as object);
    },
  };
};
