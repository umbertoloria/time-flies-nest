export interface UpdateTaskDto {
  calendarId: number;
  taskId: number;
  notes: string | undefined;
  user: ReqUser;
}
