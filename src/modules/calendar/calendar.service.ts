import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarRepository } from './calendar.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

@Injectable()
export class CalendarService {
  constructor(private repository: CalendarRepository) {}

  readCalendarIDsFromUserIdViaSortedPin(userId: number, showAll: boolean) {
    return this.repository.findCalendarsFromUserIdViaSortedPin(userId, showAll);
  }

  async findCalendarFromUser(calendarId: number, userId: number) {
    const calendar = await this.repository.findById(calendarId);

    if (!calendar || calendar.user_id !== userId) {
      throw new NotFoundException('Calendar not found');
    }

    return calendar;
  }

  createCalendar(dto: CreateCalendarDto) {
    return this.repository.create(dto);
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    await this.findCalendarFromUser(dto.calendarId, dto.user.id);

    const upd = await this.repository.update(dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Calendar not found');
    }

    return upd;
  }
}
