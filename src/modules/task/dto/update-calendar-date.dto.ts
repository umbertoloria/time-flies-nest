import {
  fromBodyGetOptionalString,
  fromBodyValidateInt,
} from '../../../lib/validate';

export class UpdateCalendarDateDto {
  constructor(
    // TODO: Use TaskID instead of (calendarId, date)
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
  ) {}

  static fromBody(urlCid: string, date: string, body: any) {
    // Validation
    const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = fromBodyGetOptionalString(body, 'notes');

    return new UpdateCalendarDateDto(
      //
      calendarId,
      date,
      notes,
    );
  }
}
