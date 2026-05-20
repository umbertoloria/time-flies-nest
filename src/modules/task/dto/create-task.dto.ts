import {
  get_optional_string,
  get_required_local_date,
  validate_int,
} from '../../../lib/validate';

export class CreateTaskDto {
  constructor(
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes: string | undefined,
  ) {}

  static fromBody(urlCid: string, body: any) {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const date = get_required_local_date(body, 'date');
    const notes = get_optional_string(body, 'notes');

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
