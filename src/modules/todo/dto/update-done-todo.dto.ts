export interface UpdateDoneTodoDto {
  calendarId: number;
  todoId: number;
  notes: string | undefined;
  readonly user: ReqUser;
}

// TODO: Unify with "UpdateTodoDto" and "MoveTodoDto"
