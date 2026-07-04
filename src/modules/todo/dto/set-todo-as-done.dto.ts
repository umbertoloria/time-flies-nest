export interface SetTodoAsDoneDto {
  calendarId: number;
  todoId: number;
  doneDate: string;
  user: ReqUser;
}
