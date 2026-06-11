export interface CreateTodoDto {
  calendarId: number;
  date: string;
  notes: string | undefined;
  user: ReqUser;
}
