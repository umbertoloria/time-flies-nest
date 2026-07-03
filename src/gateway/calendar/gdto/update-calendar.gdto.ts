import { z } from 'zod';
import { zBoolean, zHexColor } from '@dep/zod';
import { fromBodyValidateInt, validateColor } from '@core/lib/validate';
import { UpdateCalendarDto } from '@app/calendar/dto';

export const UpdateCalendarGdtoSchema = z.object({
  name: z.string().min(1, 'Invalid "name" param: must be a string'),
  color: zHexColor('Invalid "color" param: must be a color'),
  plannedColor: zHexColor('Invalid "plannedColor" param: must be a color'),
  usesNotes: zBoolean('Invalid "usesNotes" param: must be a boolean'),
});

export type UpdateCalendarGdto = z.infer<typeof UpdateCalendarGdtoSchema>;

export function dtoFromUpdateCalendarGdto(
  paramCalendarId: string,
  gdto: UpdateCalendarGdto,
  user: ReqUser,
): UpdateCalendarDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
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

  return {
    calendarId,
    fields: {
      name,
      color,
      plannedColor,
      usesNotes,
    },
    user,
  };
}
