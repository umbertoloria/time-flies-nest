import {
  fromBodyGetRequiredBool,
  fromBodyGetRequiredColor,
  fromBodyGetRequiredInt,
  fromBodyGetRequiredString,
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
    const calendarId = fromBodyGetRequiredInt(body, 'cid');
    // TODO: Here every field is required
    const name = fromBodyGetRequiredString(body, 'name');
    const color = fromBodyGetRequiredColor(body, 'color');
    const plannedColor = fromBodyGetRequiredColor(body, 'planned-color');
    const usesNotes = fromBodyGetRequiredBool(body, 'uses-notes');

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
