import { CalendarEntity } from './entity';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

export interface ICalendarRepository {
  findByUserIdOrderedBySortedPin(
    userId: string,
    includeArchivedCalendars: boolean,
  ): Promise<CalendarEntity[]>;

  findById(calendarId: number): Promise<CalendarEntity | null>;

  create(dto: CreateCalendarDto): Promise<CalendarEntity>;

  update(dto: UpdateCalendarDto): Promise<CalendarEntity>;
}
