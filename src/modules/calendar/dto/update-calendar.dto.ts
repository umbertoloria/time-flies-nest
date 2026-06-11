export interface UpdateCalendarDto {
  calendarId: number;
  name: string;
  color: string; // Es. "#115599"
  plannedColor: string; // Es. "#115599"
  usesNotes: boolean;
  user: ReqUser;
}
