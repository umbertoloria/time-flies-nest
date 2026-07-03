export interface UpdateTaskDto {
  calendarId: number;
  taskId: number;
  fields: {
    notes: string | undefined;
  };
  user: ReqUser;
}
