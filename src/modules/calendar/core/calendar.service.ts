import { CalendarRto } from '../rto';
import { calendarRepository } from './calendar.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarNotFoundError } from './errors';

export class CalendarService {
  async readCalendarIDsFromUserIdViaSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarRto[]> {
    const calendars =
      await calendarRepository.findCalendarsFromUserIdViaSortedPin(
        userId,
        showAll,
      );

    return calendars.map(CalendarRto.fromEntity);
  }

  async findCalendarFromUser(calendarId: number, userId: string) {
    const calendar = await calendarRepository.findById(calendarId);

    if (!calendar || calendar.user_id !== userId) {
      throw new CalendarNotFoundError();
    }

    return CalendarRto.fromEntity(calendar);
  }

  async createCalendar(dto: CreateCalendarDto) {
    const calendar = await calendarRepository.create(dto);

    return CalendarRto.fromEntity(calendar);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    await this.findCalendarFromUser(dto.calendarId, dto.user.id);

    const upd = await calendarRepository.update(dto);

    if (typeof upd !== 'object') {
      throw new CalendarNotFoundError();
    }

    return CalendarRto.fromEntity(upd);
  }
}
