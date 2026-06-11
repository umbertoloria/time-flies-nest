import { ICalendarRepository } from './icalendar.repository';
import { CalendarEntity } from './entity';
import { CreateCalendarDto, ReadCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarNotFoundError } from './errors';

export class CalendarService {
  constructor(private repository: ICalendarRepository) {}

  readUserCalendarsUsingSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarEntity[]> {
    return this.repository.findCalendarsByUserIdOrderedBySortedPin(
      userId,
      showAll,
    );
  }

  async findCalendarFromUserCheckOwnership(calendarId: number, userId: string) {
    const calendar = await this.repository.findById(calendarId);

    if (!calendar || calendar.userId !== userId) {
      throw new CalendarNotFoundError();
    }

    return calendar;
  }

  async findUserCalendar(dto: ReadCalendarDto) {
    return this.findCalendarFromUserCheckOwnership(dto.calendarId, dto.user.id);
  }

  async createCalendar(dto: CreateCalendarDto) {
    return this.repository.create(dto);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    await this.findCalendarFromUserCheckOwnership(dto.calendarId, dto.user.id);

    const upd = await this.repository.update(dto);

    if (typeof upd !== 'object') {
      throw new CalendarNotFoundError();
    }

    return upd;
  }
}
