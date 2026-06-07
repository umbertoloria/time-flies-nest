export class CalendarNotFoundError extends Error {
  constructor() {
    super('Calendar not found');
    this.name = 'CalendarNotFoundError';
  }
}
// throw new NotFoundException('Calendar not found');

export class CalendarUsesNotesCannotBeDisabledError extends Error {
  constructor() {
    super('Calendar UsesNotes cannot be disabled');
    this.name = 'CalendarUsesNotesCannotBeDisabledError';
  }
}
// throw new BadRequestException('Calendar UsesNotes cannot be disabled');
