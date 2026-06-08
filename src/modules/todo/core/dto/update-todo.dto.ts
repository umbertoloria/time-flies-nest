import {
  fromBodyGetOptionalString,
  fromBodyValidateInt,
} from '../../../../core/lib/validate';

export class UpdateTodoDto {
  constructor(
    //
    public readonly calendarId: number,
    public readonly todoId: number,
    public readonly notes: string | undefined,
    public readonly user: ReqUser,
  ) {}

  static fromBody(
    paramCalendarId: string,
    paramTodoId: string,
    body: any,
    user: ReqUser,
  ) {
    // Validation
    const calendarId = fromBodyValidateInt(
      paramCalendarId,
      'Invalid CalendarID',
    );
    const todoId = fromBodyValidateInt(paramTodoId, 'Invalid TodoID');
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
