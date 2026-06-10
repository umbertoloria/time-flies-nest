export interface TodoEntity {
  id: number;
  calendarId: number;
  date: string;
  doneDate?: string;
  notes?: string;
  missed?: boolean;
}
