import { fromBodyValidateInt } from '../../../lib/validate';

export class ReadCalendarDto {
  constructor(
    public readonly calendarId: number,
    public readonly user: ReqUser,
  ) {}

  static fromBody(urlCid: string, user: ReqUser) {
    // Validation
    const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');

    return new ReadCalendarDto(
      //
      calendarId,
      user,
    );
  }
}
