import {
  fromBodyGetOptionalLocalDate,
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';
import {
  CreateTodoDto,
  ReadStreamlineDto,
  ReadTodosFromDateDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from '@app/todo/dto';
import { TodoEntity } from '@app/todo/entity';
import { BadRequestError } from '@core/errors';
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
  const notes = fromBodyGetOptionalString(body, 'notes') || undefined;

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
  const date = fromBodyGetOptionalLocalDate(body, 'date');
  let notes: string | null | undefined = fromBodyGetOptionalString(
    body,
    'notes',
  );
  if (notes === '') {
    notes = null;
  }
  if (date === undefined && notes === undefined) {
    throw new BadRequestError('Invalid fields to update');
  }

  return {
    calendarId,
    todoId,
    fields: {
      date,
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
