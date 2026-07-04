export interface CreateTodoDto {
  calendarId: number;
  date?: string;
  notes?: string;
  user: ReqUser;
}

// NOTE: At least one between "date" and "notes" must be present
