import {
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';
import {
  CreateTodoDto,
  MoveTodoDto,
  ReadStreamlineDto,
  ReadTodosFromDateDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from '@app/todo/dto';
import { TodoEntity } from '@app/todo/entity';
import { CreateTaskDto } from '@app/task/dto';

export function createReadTodosFromDateDtoFromBody(
  paramCalendarId: string,
  date: string,
  user: ReqUser,
): ReadTodosFromDateDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');

  return {
    calendarId,
    date,
    user,
  };
}

export function createReadStreamlineFromBody(user: ReqUser): ReadStreamlineDto {
  return {
    user,
  };
}

export function createCreateTodoDtoFromBody(
  paramCalendarId: string,
  body: any,
  user: ReqUser,
): CreateTodoDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
  const date = fromBodyGetRequiredLocalDate(body, 'date');
  // TODO: Validate "date"
  const notes = fromBodyGetOptionalString(body, 'notes');

  return {
    calendarId,
    date,
    notes,
    user,
  };
}

export function createUpdateTodoDtoFromBody(
  paramCalendarId: string,
  paramTodoId: string,
  body: any,
  user: ReqUser,
): UpdateTodoDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
  const todoId = fromBodyValidateInt(paramTodoId, 'Invalid TodoID');
  const notes = fromBodyGetOptionalString(body, 'notes');

  return {
    calendarId,
    todoId,
    fields: {
      notes,
    },
    user,
  };
}

export function createUpdateDoneTodoDtoFromBody(
  urlCid: string,
  urlTid: string,
  body: any,
  user: ReqUser,
): UpdateDoneTodoDto {
  // Validation
  const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');
  const todoId = fromBodyValidateInt(urlTid, 'Invalid TodoID');
  const notes = fromBodyGetOptionalString(body, 'notes');

  return {
    calendarId,
    todoId,
    fields: {
      notes,
    },
    user,
  };
}

export function createMoveTodoDtoFromBody(
  paramCalendarId: string,
  paramTodoId: string,
  body: any,
  user: ReqUser,
): MoveTodoDto {
  // Validation
  const calendarId = fromBodyValidateInt(paramCalendarId, 'Invalid CalendarID');
  const todoId = fromBodyValidateInt(paramTodoId, 'Invalid TodoID');
  const date = fromBodyGetRequiredLocalDate(body, 'date');

  return {
    calendarId,
    todoId,
    fields: {
      date,
    },
    user,
  };
}

export function createCreateTaskDtoFromTodoSetAsDone(
  updTodo: TodoEntity,
  user: ReqUser,
): CreateTaskDto {
  return {
    calendarId: updTodo.calendarId,
    date: updTodo.date,
    notes: updTodo.notes ?? undefined,
    user,
  };
}
