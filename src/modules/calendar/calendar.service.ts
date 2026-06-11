import { ICalendarRepository } from './icalendar.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarNotFoundError } from './errors';

export class CalendarService {
  constructor(private repository: ICalendarRepository) {}

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
