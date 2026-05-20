import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaRepository } from '../../prisma.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

@Injectable()
export class CalendarService {
  constructor(private repo: PrismaRepository) {}

  readCalendarIDsFromUserIdViaSortedPin(userId: number, showAll: boolean) {
    return this.repo.calendar.findMany({
      where: {
        user_id: userId,
        ...(showAll
          ? {}
          : {
              sorted_pin: {
                not: null,
              },
            }),
      },
      orderBy: {
        sorted_pin: 'asc',
      },
    });
  }

  async readCalendarByIDAndUser(calendarId: number, userId: number) {
    const dbCalendar = await this.repo.calendar.findUnique({
      where: {
        id: calendarId,
        user_id: userId,
      },
    });

    if (!dbCalendar) {
      throw new NotFoundException('Calendar not found');
    }

    return dbCalendar;
  }

  createCalendar(dto: CreateCalendarDto) {
    return this.repo.calendar.create({
      data: {
        name: dto.name,
        color: dto.color,
        planned_color: dto.plannedColor,
        uses_notes: dto.usesNotes,
        user_id: dto.user.id,
      },
    });
  }

  async updateCalendar(dto: UpdateCalendarDto) {
    const dbCalendar = await this.readCalendarByIDAndUser(
      dto.calendarId,
      dto.user.id,
    );

    const upd = await this.repo.calendar.update({
      where: {
        id: dbCalendar.id,
        user_id: dbCalendar.user_id,
      },
      data: {
        name: dto.name,
        color: dto.color,
        planned_color: dto.plannedColor,
        uses_notes: dto.usesNotes,
      },
    });

    if (typeof upd !== 'object') {
      throw new NotFoundException('Calendar not found');
    }

    return upd;
  }
}
