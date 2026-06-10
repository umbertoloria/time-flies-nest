import {
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';

export class MoveTodoDto {
  constructor(
    //
    public readonly calendarId: number,
    public readonly todoId: number,
    public readonly date: string,
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
