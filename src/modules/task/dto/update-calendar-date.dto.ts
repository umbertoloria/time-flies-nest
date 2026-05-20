import { get_optional_string, validate_int } from '../../../lib/validate';

export class UpdateCalendarDateDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
  ) {}

  static fromBody(urlCid: string, date: string, body: any) {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = get_optional_string(body, 'notes');

    return new UpdateCalendarDateDto(
      //
      calendarId,
      date,
      notes,
    );
  }
}
