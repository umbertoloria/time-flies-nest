import {
  fromBodyGetRequiredBool,
  fromBodyGetRequiredColor,
  fromBodyGetRequiredString,
  fromBodyValidateInt,
} from '@core/lib/validate';
import { CreateCalendarDto, ReadCalendarDto } from '@app/calendar/dto';

export function createCreateCalendarDtoFromBody(
  body: any,
  user: ReqUser,
): CreateCalendarDto {
  // Validation
  const name = fromBodyGetRequiredString(body, 'name');
  const color = fromBodyGetRequiredColor(body, 'color');
  const plannedColor = fromBodyGetRequiredColor(body, 'planned-color');
  const usesNotes = fromBodyGetRequiredBool(body, 'uses-notes');

  return {
    name,
    color,
    plannedColor,
    usesNotes,
    user,
  };
}

export function createReadCalendarDtoFromParam(
  paramCalendarId: string,
  user: ReqUser,
): ReadCalendarDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');

  return {
    calendarId,
    user,
  };
}
