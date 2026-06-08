import {
  fromBodyGetOptionalString,
  fromBodyValidateInt,
} from '../../../../lib/validate';

export class UpdateDoneTodoDto {
  // TODO: Unify with "UpdateTodoDto" and "MoveTodoDto"
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

    return new UpdateDoneTodoDto(
      //
      calendarId,
      todoId,
      notes,
      user,
    );
  }
}
