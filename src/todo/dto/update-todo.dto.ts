import { get_optional_string, validate_int } from '../../lib/validate';

export class UpdateTodoDto {
  constructor(
    //
    public readonly calendarId: number,
    public readonly todoId: number,
    public readonly notes: string | undefined,
    public readonly user: ReqUser,
  ) {}

  static fromBody(urlCid: string, urlTid: string, body: any, user: ReqUser) {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const notes = get_optional_string(body, 'notes');

    return new UpdateTodoDto(
      //
      calendarId,
      todoId,
      notes,
      user,
    );
  }
}
