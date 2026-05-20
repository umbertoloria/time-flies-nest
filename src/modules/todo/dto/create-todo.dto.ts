import { get_optional_string, validate_int } from '../../../lib/validate';

export class CreateTodoDto {
  constructor(
    //
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
    public readonly user: ReqUser,
  ) {}

  static fromBody(urlCid: string, date: string, body: any, user: ReqUser) {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = get_optional_string(body, 'notes');

    return new CreateTodoDto(
      //
      calendarId,
      date,
      notes,
      user,
    );
  }
}
