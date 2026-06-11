import { ICalendarRepository } from './icalendar.repository';
import { CalendarEntity } from './entity';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarNotFoundError } from './errors';

export class CalendarService {
  constructor(private repository: ICalendarRepository) {}

  // AUTHZ

  findUserCalendars(user: ReqUser): Promise<CalendarEntity[]> {
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

  // BUSINESS

  readUserCalendarsUsingSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarEntity[]> {
    return this.repository.findByUserIdOrderedBySortedPin(userId, showAll);
  }

  async createCalendar(dto: CreateCalendarDto) {
    return this.repository.create(dto);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    const upd = await this.repository.update(dto);

    if (typeof upd !== 'object') {
      throw new CalendarNotFoundError();
    }

    return upd;
  }
}
