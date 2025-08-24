export const getSDK = (
  phpBaseUrl: string | undefined,
  apiKey: string | undefined,
) => {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Authorization', `Bearer ${apiKey}`);

  return {
    readCalendarByID: (calendarId: number) =>
      fetch(`${phpBaseUrl}?a=calendar-read&cid=${calendarId}`, {
        method: 'GET',
        headers,
      }).then((response) => response.text()),
  };
};
