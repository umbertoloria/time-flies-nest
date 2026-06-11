export interface CreateTaskDto {
  calendarId: number;
  date: string;
  notes: string | undefined;
}
