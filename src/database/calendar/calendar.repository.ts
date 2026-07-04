import { ICalendarRepository } from '@app/calendar/icalendar.repository';
import { ExtendedPrismaClient } from '@dep/prisma';
import { TraceMethod } from '@core/trace';
import { CacheMethod, EvictCache } from '@core/cache';
import { CreateCalendarDto, UpdateCalendarDto } from '@app/calendar/dto';
import {
  entitiesFromCalendars,
  entityFromCalendar,
  entityFromCalendarOrNull,
} from './entity-mapper';

export class CalendarRepository implements ICalendarRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  @CacheMethod()
  @TraceMethod()
  async findByUserIdOrderedBySortedPin(
    userId: string,
    includeArchivedCalendars: boolean,
  ) {
    const records = await this.prisma.calendar.findMany({
      where: {
        user_id: userId,
        ...(includeArchivedCalendars
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

  @CacheMethod()
  async findById(calendarId: number) {
    const record = await this.prisma.calendar.findUnique({
      where: {
        id: calendarId,
      },
    });

    return entityFromCalendarOrNull(record);
  }

  @EvictCache()
  async create(dto: CreateCalendarDto) {
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

  @EvictCache()
  async update(dto: UpdateCalendarDto) {
    const record = await this.prisma.calendar.update({
      where: {
        id: dto.calendarId,
      },
      data: {
        name: dto.fields.name,
        color: dto.fields.color,
        planned_color: dto.fields.plannedColor,
        uses_notes: dto.fields.usesNotes,
      },
    });

    return entityFromCalendar(record);
  }
}
