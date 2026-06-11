import {
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';

export class CreateTodoDto {
  constructor(
    //
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
    public readonly user: ReqUser,
  ) {}

  static fromBody(paramCalendarId: string, body: any, user: ReqUser) {
    // Validation
    const calendarId = fromBodyValidateInt(
      paramCalendarId,
      'Invalid CalendarID',
    );
    const date = fromBodyGetRequiredLocalDate(body, 'date');
    // TODO: Validate "date"
    const notes = fromBodyGetOptionalString(body, 'notes');

    return new CreateTodoDto(
      //
      calendarId,
      date,
      notes,
      user,
    );
  }
}
