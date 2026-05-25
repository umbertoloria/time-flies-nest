import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarRepository } from './calendar.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

@Injectable()
export class CalendarService {
  constructor(private repository: CalendarRepository) {}

  readCalendarIDsFromUserIdViaSortedPin(userId: number, showAll: boolean) {
    return this.repository.readCalendarIDsFromUserIdViaSortedPin(
      userId,
      showAll,
    );
  }

  async readCalendarByIDAndUser(calendarId: number, userId: number) {
    const dbCalendar = await this.repository.findCalendarByIDAndUser(
      calendarId,
      userId,
    );

    if (!dbCalendar) {
      throw new NotFoundException('Calendar not found');
    }

    return dbCalendar;
  }

  createCalendar(dto: CreateCalendarDto) {
    return this.repository.create(dto);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    const dbCalendar = await this.readCalendarByIDAndUser(
      dto.calendarId,
      dto.user.id,
    );

    const upd = await this.repository.update(dbCalendar, dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Calendar not found');
    }

    return upd;
  }
}
