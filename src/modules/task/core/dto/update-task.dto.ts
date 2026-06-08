import {
  fromBodyGetOptionalString,
  fromBodyValidateInt,
} from '@shared/core/lib/validate';

export class UpdateTaskDto {
  constructor(
    public readonly calendarId: number,
    public readonly taskId: number,
    public readonly notes: string | undefined,
  ) {}

  static fromBody(paramCalendarId: string, paramTaskId: string, body: any) {
    // Validation
    const calendarId = fromBodyValidateInt(
      paramCalendarId,
      'Invalid CalendarID',
    );
    const taskId = fromBodyValidateInt(paramTaskId, 'Invalid TaskID');
    const notes = fromBodyGetOptionalString(body, 'notes');

    return new UpdateTaskDto(
      //
      calendarId,
      taskId,
      notes,
    );
  }
}
