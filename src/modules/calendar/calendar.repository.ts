import { Injectable } from '@nestjs/common';
import { Calendar, PrismaRepository } from '../../prisma.repository';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

@Injectable()
export class CalendarRepository {
  constructor(private readonly repo: PrismaRepository) {}

  public findCalendarsFromUserIdViaSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<Calendar[]> {
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

  public findById(calendarId: number): Promise<Calendar | null> {
    return this.repo.calendar.findUnique({
      where: {
        id: calendarId,
      },
    });
  }

  public create(dto: CreateCalendarDto): Promise<Calendar> {
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

  public update(dto: UpdateCalendarDto): Promise<Calendar> {
    return this.repo.calendar.update({
      where: {
        id: dto.calendarId,
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
