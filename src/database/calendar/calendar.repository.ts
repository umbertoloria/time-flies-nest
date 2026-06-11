import { ICalendarRepository } from '@app/calendar/icalendar.repository';
import { ExtendedPrismaClient } from '@dep/prisma';
import { CreateCalendarDto, UpdateCalendarDto } from '@app/calendar/dto';
import {
  entitiesFromCalendars,
  entityFromCalendar,
  entityFromCalendarOrNull,
} from './entity-mapper';
import { TraceMethod } from '@core/trace';

export class CalendarRepository implements ICalendarRepository {
  constructor(private prisma: ExtendedPrismaClient) {}

  @TraceMethod()
  async findCalendarsByUserIdOrderedBySortedPin(
    userId: string,
    showAll: boolean,
  ) {
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

  @TraceMethod()
  async findById(calendarId: number) {
    const record = await this.prisma.calendar.findUnique({
      where: {
        id: calendarId,
      },
    });

    return entityFromCalendarOrNull(record);
  }

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

  async update(dto: UpdateCalendarDto) {
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
