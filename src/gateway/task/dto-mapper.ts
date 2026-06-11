import {
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';
import { CreateTaskDto } from '@app/task/dto';

export function createCreateTaskDtoFromBody(
  paramCalendarId: string,
  body: any,
): CreateTaskDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
  const date = fromBodyGetRequiredLocalDate(body, 'date');
  const notes = fromBodyGetOptionalString(body, 'notes');

  return {
    calendarId,
    date,
    notes,
  };
}
