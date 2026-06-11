export interface UpdateTodoDto {
  calendarId: number;
  todoId: number;
  notes: string | undefined;
  user: ReqUser;
}
