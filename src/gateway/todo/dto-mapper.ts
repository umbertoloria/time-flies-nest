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
  SetTodoAsDoneDto,
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

export function createReadStreamlineFromBody(
  paramIncludeArchivedCalendars: string | undefined,
  user: ReqUser,
): ReadStreamlineDto {
  // Validation
  const includeArchivedCalendars = paramIncludeArchivedCalendars === 'true';

  return {
    includeArchivedCalendars,
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

type SetTodoAsDoneValidatedFields = {
  calendarId: number;
  todoId: number;
  notes?: string | null;
};

export function validateFieldsForSetTodoAsDoneDtoFromBody(
  urlCid: string,
  urlTid: string,
): SetTodoAsDoneValidatedFields {
  // Validation
  const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');
  const todoId = fromBodyValidateInt(urlTid, 'Invalid TodoID');

  return {
    calendarId,
    todoId,
  };
}

export function createSetTodoAsDoneDtoFromValidatedFields(
  validatedFields: SetTodoAsDoneValidatedFields,
  doneDate: string,
  user: ReqUser,
): SetTodoAsDoneDto {
  return {
    calendarId: validatedFields.calendarId,
    todoId: validatedFields.todoId,
    doneDate,
    user,
  };
}

export function createCreateTaskDtoFromTodoSetAsDone(
  updTodo: TodoEntity,
  user: ReqUser,
): CreateTaskDto {
  return {
    calendarId: updTodo.calendarId,
    date: updTodo.doneDate!, // Assuming "updTodo" has a DoneDate.
    notes: updTodo.notes ?? undefined,
    user,
  };
}
