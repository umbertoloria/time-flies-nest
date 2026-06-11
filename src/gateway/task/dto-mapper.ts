import {
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';
import {
  CreateTaskDto,
  ReadCalendarDateDto,
  UpdateTaskDto,
} from '@app/task/dto';

export function createCreateTaskDtoFromBody(
  paramCalendarId: string,
  body: any,
  user: ReqUser,
): CreateTaskDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
  const date = fromBodyGetRequiredLocalDate(body, 'date');
  const notes = fromBodyGetOptionalString(body, 'notes');

  return {
    calendarId,
    date,
    notes,
    user,
  };
}

export function createReadCalendarDateDtoFromBody(
  paramCalendarId: string,
  date: string,
  user: ReqUser,
): ReadCalendarDateDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');

  return {
    calendarId,
    date,
    user,
  };
}

export function createUpdateTaskDtoFomBody(
  paramCalendarId: string,
  paramTaskId: string,
  body: any,
  user: ReqUser,
): UpdateTaskDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
  const taskId = fromBodyValidateInt(paramTaskId, 'Invalid TaskID');
  const notes = fromBodyGetOptionalString(body, 'notes');

  return {
    calendarId,
    taskId,
    notes,
    user,
  };
}
