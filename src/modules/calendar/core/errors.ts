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
