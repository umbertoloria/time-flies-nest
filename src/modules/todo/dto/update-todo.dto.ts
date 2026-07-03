export interface UpdateTodoDto {
  calendarId: number;
  todoId: number;
  fields: {
    notes: string | undefined;
  };
  user: ReqUser;
}
