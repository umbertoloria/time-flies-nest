export interface CalendarEntity {
  id: number;
  userId: string;
  name: string;
  color: string;
  plannedColor: string;
  usesNotes?: boolean;
  sortedPin?: number;
}
