export interface MoveTodoDto {
  calendarId: number;
  todoId: number;
  fields: {
    date: string;
  };
  user: ReqUser;
}
