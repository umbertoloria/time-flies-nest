import { Calendar, prisma } from '../../../dependent/prisma.repository';
import { CreateCalendarDto, UpdateCalendarDto } from '../core/dto';

class CalendarRepository {
  public findCalendarsFromUserIdViaSortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<Calendar[]> {
    return prisma.calendar.findMany({
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
    return prisma.calendar.findUnique({
      where: {
        id: calendarId,
      },
    });
  }

  public create(dto: CreateCalendarDto): Promise<Calendar> {
    return prisma.calendar.create({
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
    return prisma.calendar.update({
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

export const calendarRepository = new CalendarRepository();
