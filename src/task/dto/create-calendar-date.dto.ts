import {
  get_optional_string,
  validate_date,
  validate_int,
} from '../../lib/validate';

export class CreateCalendarDateDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
  ) {}

  static fromBody(urlCid: string, urlDate: string, body: any) {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const date = validate_date(urlDate, 'Invalid Date');
    // TODO: Validate "date"
    const notes = get_optional_string(body, 'notes');

    return new CreateCalendarDateDto(
      //
      calendarId,
      date,
      notes,
    );
  }
}
