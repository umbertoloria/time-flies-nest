import { fromBodyValidateInt } from '@core/lib/validate';

export class ReadCalendarDto {
  constructor(
    public readonly calendarId: number,
    public readonly user: ReqUser,
  ) {}

  static fromParam(paramCalendarId: string, user: ReqUser) {
    // Validation
    const calendarId = fromBodyValidateInt(
      paramCalendarId,
      'Invalid CalendarID',
    );

    return new ReadCalendarDto(
      //
      calendarId,
      user,
    );
  }
}
