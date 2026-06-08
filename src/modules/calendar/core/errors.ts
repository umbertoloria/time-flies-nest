export class CalendarNotFoundError extends Error {
  constructor() {
    super('Calendar not found');
    this.name = 'CalendarNotFoundError';
  }
}

export class CalendarUsesNotesCannotBeDisabledError extends Error {
  constructor() {
    super('Calendar UsesNotes cannot be disabled');
    this.name = 'CalendarUsesNotesCannotBeDisabledError';
  }
}

export const mapCalendarError2StatusCode = new Map<Function, number>([
  [CalendarNotFoundError, 404],
  [CalendarUsesNotesCannotBeDisabledError, 400],
]);
