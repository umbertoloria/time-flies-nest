export interface UpdateCalendarDto {
  calendarId: number;
  fields: {
    name: string;
    color: string; // Es. "#115599"
    plannedColor: string; // Es. "#115599"
    usesNotes: boolean;
  };
  user: ReqUser;
}
