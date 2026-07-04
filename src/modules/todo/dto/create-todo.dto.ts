export interface CreateTodoDto {
  calendarId: number;
  date: string;
  notes: string | undefined;
  user: ReqUser;
}

// TODO: Support Unplanned Todos create (date or notes should be present)
