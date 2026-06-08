import {
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '../../../../lib/validate';
import { TodoRto } from '../../../todo/dependent/rto';

export class CreateTaskDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
  ) {}

  static fromBody(paramCalendarId: string, body: any) {
    // Validation
    const calendarId = fromBodyValidateInt(
      paramCalendarId,
      'Invalid CalendarID',
    );
    const date = fromBodyGetRequiredLocalDate(body, 'date');
    const notes = fromBodyGetOptionalString(body, 'notes');

    return new CreateTaskDto(
      //
      calendarId,
      date,
      notes,
    );
  }

  static fromTodoSetAsDone(updTodo: TodoRto) {
    return new CreateTaskDto(
      //
      updTodo.calendarId,
      updTodo.date,
      updTodo.notes || undefined,
    );
  }
}
