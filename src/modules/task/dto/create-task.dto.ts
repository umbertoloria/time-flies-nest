import {
  fromBodyGetOptionalString,
  fromBodyGetRequiredLocalDate,
  fromBodyValidateInt,
} from '../../../lib/validate';

export class CreateTaskDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
  ) {}

  static fromBody(urlCid: string, body: any) {
    // Validation
    const calendarId = fromBodyValidateInt(urlCid, 'Invalid CalendarID');
    const date = fromBodyGetRequiredLocalDate(body, 'date');
    const notes = fromBodyGetOptionalString(body, 'notes');

    return new CreateTaskDto(
      //
      calendarId,
      date,
      notes,
    );
  }

  static fromTodoSetAsDone(updTodo: {
    calendar_id: number;
    date: string;
    notes: string | null;
  }) {
    return new CreateTaskDto(
      //
      updTodo.calendar_id,
      updTodo.date,
      updTodo.notes || undefined,
    );
  }
}
