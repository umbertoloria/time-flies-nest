import { fromBodyValidateInt, validateColor } from '@core/lib/validate';
import { UpdateCalendarGdto } from '../dependent/gdto';

export class UpdateCalendarDto {
  constructor(
    public readonly calendarId: number,
    public readonly name: string,
    public readonly color: string, // Es. "#115599"
    public readonly plannedColor: string, // Es. "#115599"
    public readonly usesNotes: boolean,
    public readonly user: ReqUser,
  ) {}

  static fromParam(
    paramCalendarId: string,
    gdto: UpdateCalendarGdto,
    user: ReqUser,
  ) {
    // Validation
    const calendarId = fromBodyValidateInt(
      paramCalendarId,
      'Invalid CalendarID',
    );
    // TODO: Here every field is required
    const name = gdto.name;
    const color = validateColor(
      gdto.color,
      'Param "color" invalid: must be a color',
    );
    const plannedColor = validateColor(
      gdto.plannedColor,
      'Param "plannedColor" invalid: must be a color',
    );
    const usesNotes = gdto.usesNotes;

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
