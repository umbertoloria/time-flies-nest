import { ICalendarRepository } from './icalendar.repository';
import { CalendarEntity } from './entity';
import { CalendarNotFoundError } from './errors';

export class CalendarAuthz {
  constructor(private repository: ICalendarRepository) {}

  findUserCalendars(
    user: ReqUser,
    showArchived: boolean,
  ): Promise<CalendarEntity[]> {
    return this.repository.findByUserIdOrderedBySortedPin(
      user.id,
      showArchived,
    );
  }

  findUserCalendarsAll(user: ReqUser): Promise<CalendarEntity[]> {
    return this.repository.findByUserIdOrderedBySortedPin(user.id, true);
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
