import { ICalendarRepository } from './icalendar.repository';
import { CalendarEntity } from './entity';
import { CalendarNotFoundError } from './errors';

export class CalendarAuthz {
  constructor(private repository: ICalendarRepository) {}

  async findUserCalendars(
    user: ReqUser,
    includeArchivedCalendars: boolean,
  ): Promise<CalendarEntity[]> {
    return await this.repository.findByUserIdOrderedBySortedPin(
      user.id,
      includeArchivedCalendars,
    );
  }

  async findUserOwnCalendar(
    calendarId: number,
    user: ReqUser,
  ): Promise<CalendarEntity> {
    const calendar = await this.repository.findById(calendarId);

    if (!calendar || calendar.userId !== user.id) {
      throw new CalendarNotFoundError();
    }

    return calendar;
  }
}
