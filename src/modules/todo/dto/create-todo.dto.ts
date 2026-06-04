import {
  fromBodyGetOptionalString,
  fromBodyValidateInt,
} from '../../../lib/validate';

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
    const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');
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
