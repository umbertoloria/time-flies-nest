import {
  fromBodyGetOptionalLocalDate,
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';
import {
  CreateTaskDto,
  ReadTasksFromDateDto,
  UpdateTaskDto,
} from '@app/task/dto';
import { BadRequestError } from '@core/errors';

export function createCreateTaskDtoFromBody(
  paramCalendarId: string,
  body: any,
  user: ReqUser,
): CreateTaskDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
  const date = fromBodyGetRequiredLocalDate(body, 'date');
  const notes = fromBodyGetOptionalString(body, 'notes') || undefined;

  return {
    calendarId,
    date,
    notes,
    user,
  };
}

export function createReadTasksFromDateDtoFromBody(
  paramCalendarId: string,
  date: string,
  user: ReqUser,
): ReadTasksFromDateDto {
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
  const date = fromBodyGetOptionalLocalDate(body, 'date');
  const notes = fromBodyGetOptionalString(body, 'notes');
  if (date === undefined && notes === undefined) {
    throw new BadRequestError('Invalid fields to update');
  }

  return {
    calendarId,
    taskId,
    fields: {
      date,
      notes,
    },
    user,
  };
}
