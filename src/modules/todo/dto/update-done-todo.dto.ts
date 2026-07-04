export interface UpdateDoneTodoDto {
  calendarId: number;
  todoId: number;
  fields: {
    notes: string | undefined;
  };
  user: ReqUser;
}

// TODO: Unify with "UpdateDoneTodoDto" and "UpdateTodoDto"
