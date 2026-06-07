import { CalendarRepository } from './calendar.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarRto } from './rto';
import { CalendarNotFoundError } from './core/errors';

export class CalendarService {
  constructor(private repository: CalendarRepository) {}

  async readCalendarIDsFromUserIdViaSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarRto[]> {
    const calendars = await this.repository.findCalendarsFromUserIdViaSortedPin(
      userId,
      showAll,
    );

    return calendars.map(CalendarRto.fromEntity);
  }

  async findCalendarFromUser(calendarId: number, userId: string) {
    const calendar = await this.repository.findById(calendarId);

    if (!calendar || calendar.user_id !== userId) {
      throw new CalendarNotFoundError();
    }

    return CalendarRto.fromEntity(calendar);
  }

  async createCalendar(dto: CreateCalendarDto) {
    const calendar = await this.repository.create(dto);

    return CalendarRto.fromEntity(calendar);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    await this.findCalendarFromUser(dto.calendarId, dto.user.id);

    const upd = await this.repository.update(dto);

    if (typeof upd !== 'object') {
      throw new CalendarNotFoundError();
    }

    return CalendarRto.fromEntity(upd);
  }
}
