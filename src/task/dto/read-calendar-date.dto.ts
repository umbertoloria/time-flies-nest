import { validate_int } from '../../lib/validate';

export class ReadCalendarDateDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly user: ReqUser,
  ) {}

  static fromBody(urlCid: string, date: string, user: ReqUser) {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');

    return new ReadCalendarDateDto(
      //
      calendarId,
      date,
      user,
    );
  }
}
