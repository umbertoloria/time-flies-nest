export interface UpdateTaskDto {
  calendarId: number;
  taskId: number;
  fields: {
    date?: string;
    notes?: string | null;
  };
  user: ReqUser;
}
