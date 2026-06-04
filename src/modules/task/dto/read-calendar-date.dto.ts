import { fromBodyValidateInt } from '../../../lib/validate';

export class ReadCalendarDateDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly user: ReqUser,
  ) {}

  static fromBody(urlCid: string, date: string, user: ReqUser) {
    // Validation
    const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');

    return new ReadCalendarDateDto(
      //
      calendarId,
      date,
      user,
    );
  }
}
