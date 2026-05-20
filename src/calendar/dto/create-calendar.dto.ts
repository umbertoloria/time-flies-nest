import {
  get_required_bool,
  get_required_color,
  get_required_string,
} from '../../lib/validate';

export class CreateCalendarDto {
  constructor(
    public readonly name: string,
    public readonly color: string, // Es. "#115599"
    public readonly plannedColor: string, // Es. "#115599"
    public readonly usesNotes: boolean,
    public readonly user: ReqUser,
  ) {}

  static fromBody(body: any, user: ReqUser) {
    // Validation
    const name = get_required_string(body, 'name');
    const color = get_required_color(body, 'color');
    const plannedColor = get_required_color(body, 'planned-color');
    const usesNotes = get_required_bool(body, 'uses-notes');

    return new CreateCalendarDto(
      //
      name,
      color,
      plannedColor,
      usesNotes,
      user,
    );
  }
}
