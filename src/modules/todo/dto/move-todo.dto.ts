import {
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '../../../lib/validate';

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
    const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');
    const todoId = fromBodyValidateInt(urlTid, 'Invalid TodoID');
    const date = fromBodyGetRequiredLocalDate(body, 'date');

    return new MoveTodoDto(
      //
      calendarId,
      todoId,
      date,
      user,
    );
  }
}
