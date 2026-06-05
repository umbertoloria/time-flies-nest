import { fromBodyValidateInt } from '../../../lib/validate';

export class ReadCalendarDateDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly user: ReqUser,
  ) {}

  static fromBody(paramCalendarId: string, date: string, user: ReqUser) {
    // Validation
    const calendarId = fromBodyValidateInt(
      paramCalendarId,
      'Invalid CalendarID',
    );

    return new ReadCalendarDateDto(
      //
      calendarId,
      date,
      user,
    );
  }
}
