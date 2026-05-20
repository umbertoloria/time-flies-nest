import { get_required_local_date, validate_int } from '../../../lib/validate';

export class MoveTodoDto {
  constructor(
    //
    public readonly calendarId: number,
    public readonly todoId: number,
    public readonly date: string,
    public readonly user: ReqUser,
  ) {}

  static fromBody(urlCid: string, urlTid: string, body: any, user: ReqUser) {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const date = get_required_local_date(body, 'date');

    return new MoveTodoDto(
      //
      calendarId,
      todoId,
      date,
      user,
    );
  }
}
