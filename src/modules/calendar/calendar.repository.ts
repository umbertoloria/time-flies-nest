import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../prisma.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

@Injectable()
export class CalendarRepository {
  constructor(private readonly repo: PrismaRepository) {}

  public readCalendarIDsFromUserIdViaSortedPin(
    userId: number,
    showAll: boolean,
  ) {
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

  public findCalendarByIDAndUser(calendarId: number, userId: number) {
    return this.repo.calendar.findUnique({
      where: {
        id: calendarId,
        user_id: userId,
      },
    });
  }

  public create(dto: CreateCalendarDto) {
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

  public update(
    dbCalendar: { id: number; user_id: number },
    dto: UpdateCalendarDto,
  ) {
    return this.repo.calendar.update({
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
  }
}
