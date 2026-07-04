export interface UpdateTodoDto {
  calendarId: number;
  todoId: number;
  fields: {
    date?: string;
    notes?: string | null;
  };
  user: ReqUser;
}
