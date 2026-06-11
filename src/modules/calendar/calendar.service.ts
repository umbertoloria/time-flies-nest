import { ICalendarRepository } from './icalendar.repository';
import { CalendarEntity } from './entity';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarNotFoundError } from './errors';

export class CalendarService {
  constructor(private repository: ICalendarRepository) {}

  readCalendarIDsFromUserIdViaSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarEntity[]> {
    return this.repository.findCalendarsFromUserIdViaSortedPin(userId, showAll);
  }

  async findCalendarFromUser(calendarId: number, userId: string) {
    const calendar = await this.repository.findById(calendarId);

    if (!calendar || calendar.userId !== userId) {
      throw new CalendarNotFoundError();
    }

    return calendar;
  }

  async createCalendar(dto: CreateCalendarDto) {
    return this.repository.create(dto);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    await this.findCalendarFromUser(dto.calendarId, dto.user.id);

    const upd = await this.repository.update(dto);

    if (typeof upd !== 'object') {
      throw new CalendarNotFoundError();
    }

    return upd;
  }
}
