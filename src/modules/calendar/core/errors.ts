export class CalendarUsesNotesCannotBeDisabledError extends Error {
  constructor() {
    super('Calendar UsesNotes cannot be disabled');
    this.name = 'CalendarUsesNotesCannotBeDisabledError';
  }
}
// throw new BadRequestException('Calendar UsesNotes cannot be disabled');
