import {
  fromBodyGetOptionalString,
  fromBodyValidateInt,
} from '../../../../lib/validate';

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
    const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');
    const todoId = fromBodyValidateInt(urlTid, 'Invalid TodoID');
    const notes = fromBodyGetOptionalString(body, 'notes');

    return new UpdateTodoDto(
      //
      calendarId,
      todoId,
      notes,
      user,
    );
  }
}
