import {
  fromBodyGetRequiredBool,
  fromBodyGetRequiredColor,
  fromBodyGetRequiredString,
} from '../../../../common/core/lib/validate';

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
    const name = fromBodyGetRequiredString(body, 'name');
    const color = fromBodyGetRequiredColor(body, 'color');
    const plannedColor = fromBodyGetRequiredColor(body, 'planned-color');
    const usesNotes = fromBodyGetRequiredBool(body, 'uses-notes');

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
