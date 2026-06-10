import { ExtendedPrismaClient } from '@dep/prisma';
import { CreateCalendarDto, UpdateCalendarDto } from '../core/dto';
import {
  entitiesFromCalendars,
  entityFromCalendar,
  entityFromCalendarOrNull,
} from './entity-mapper.ts';
import { CalendarEntity } from '@app/calendar/core/entity';

export class CalendarRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  public async findCalendarsFromUserIdViaSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarEntity[]> {
    const records = await this.prisma.calendar.findMany({
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

    return entitiesFromCalendars(records);
  }

  public async findById(calendarId: number): Promise<CalendarEntity | null> {
    const record = await this.prisma.calendar.findUnique({
      where: {
        id: calendarId,
      },
    });

    return entityFromCalendarOrNull(record);
  }

  public async create(dto: CreateCalendarDto): Promise<CalendarEntity> {
    const record = await this.prisma.calendar.create({
      data: {
        name: dto.name,
        color: dto.color,
        planned_color: dto.plannedColor,
        uses_notes: dto.usesNotes,
        user_id: dto.user.id,
      },
    });

    return entityFromCalendar(record);
  }

  public async update(dto: UpdateCalendarDto): Promise<CalendarEntity> {
    const record = await this.prisma.calendar.update({
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

    return entityFromCalendar(record);
  }
}
