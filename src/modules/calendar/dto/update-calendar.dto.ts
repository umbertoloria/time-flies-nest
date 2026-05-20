import {
  get_required_bool,
  get_required_color,
  get_required_int,
  get_required_string,
} from '../../../lib/validate';

export class UpdateCalendarDto {
  constructor(
    public readonly calendarId: number,
    public readonly name: string,
    public readonly color: string, // Es. "#115599"
    public readonly plannedColor: string, // Es. "#115599"
    public readonly usesNotes: boolean,
    public readonly user: ReqUser,
  ) {}

  static fromBody(body: any, user: ReqUser) {
    // Validation
    const calendarId = get_required_int(body, 'cid');
    // TODO: Here every field is required
    const name = get_required_string(body, 'name');
    const color = get_required_color(body, 'color');
    const plannedColor = get_required_color(body, 'planned-color');
    const usesNotes = get_required_bool(body, 'uses-notes');

    return new UpdateCalendarDto(
      //
      calendarId,
      name,
      color,
      plannedColor,
      usesNotes,
      user,
    );
  }
}
