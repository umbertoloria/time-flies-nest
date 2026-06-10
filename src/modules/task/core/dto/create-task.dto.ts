import {
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '@core/lib/validate';
import { TodoEntity } from '@app/todo/core/entity';

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

  static fromTodoSetAsDone(updTodo: TodoEntity) {
    return new CreateTaskDto(
      //
      updTodo.calendarId,
      updTodo.date,
      updTodo.notes || undefined,
    );
  }
}
