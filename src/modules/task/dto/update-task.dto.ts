export interface UpdateTaskDto {
  calendarId: number;
  taskId: number;
  fields: {
    date?: string | null;
    notes?: string;
  };
  user: ReqUser;
}
