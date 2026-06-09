import { CalendarRto } from '../dependent/rto';
import { CalendarRepository } from '../dependent/calendar.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarNotFoundError } from './errors';

export class CalendarService {
  constructor(private calendarRepository: CalendarRepository) {}

  async readCalendarIDsFromUserIdViaSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarRto[]> {
    const calendars =
      await this.calendarRepository.findCalendarsFromUserIdViaSortedPin(
        userId,
        showAll,
      );

    return calendars.map(CalendarRto.fromEntity);
  }

  async findCalendarFromUser(calendarId: number, userId: string) {
    const calendar = await this.calendarRepository.findById(calendarId);

    if (!calendar || calendar.user_id !== userId) {
      throw new CalendarNotFoundError();
    }

    return CalendarRto.fromEntity(calendar);
  }

  async createCalendar(dto: CreateCalendarDto) {
    const calendar = await this.calendarRepository.create(dto);

    return CalendarRto.fromEntity(calendar);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    await this.findCalendarFromUser(dto.calendarId, dto.user.id);

    const upd = await this.calendarRepository.update(dto);

    if (typeof upd !== 'object') {
      throw new CalendarNotFoundError();
    }

    return CalendarRto.fromEntity(upd);
  }
}
