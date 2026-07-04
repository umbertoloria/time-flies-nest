export interface UpdateTodoDto {
  calendarId: number;
  todoId: number;
  fields: {
    date?: string;
    notes?: string | null;
  };
  user: ReqUser;
}

// TODO: Support Unplanned Todos update (date or notes should be present)
