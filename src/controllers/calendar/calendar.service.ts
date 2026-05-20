import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCalendarDto } from '../../calendar/dto';

@Injectable()
export class CalendarService {
  constructor(
    //
    private prismaService: PrismaService,
  ) {}

  readCalendarIDsFromUserIdViaSortedPin(user_id: number, showAll: boolean) {
    return this.prismaService.calendar.findMany({
      where: {
        user_id,
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

  readCalendarByIDAndUser(calendar_id: number, user_id: number) {
    return this.prismaService.calendar.findUnique({
      where: {
        id: calendar_id,
        user_id,
      },
    });
  }

  createCalendar(dto: CreateCalendarDto) {
    return this.prismaService.calendar.create({
      data: {
        name: dto.name,
        color: dto.color,
        planned_color: dto.plannedColor,
        uses_notes: dto.usesNotes,
        user_id: dto.user.id,
      },
    });
  }

  async updateCalendar(
    calendarId: number,
    userId: number,
    data: {
      name: string;
      color: string; // Es. "#115599"
      plannedColor: string; // Es. "#115599"
      usesNotes: boolean;
    },
  ) {
    const dbCalendar = await this.readCalendarByIDAndUser(calendarId, userId);
    if (!dbCalendar) {
      return 'not-found';
    }
    return await this.prismaService.calendar.update({
      where: {
        id: calendarId,
        user_id: userId,
      },
      data: {
        name: data.name,
        color: data.color,
        planned_color: data.plannedColor,
        uses_notes: data.usesNotes,
      },
    });
  }
}
