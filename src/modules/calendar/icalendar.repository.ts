import { CalendarEntity } from './entity';
import { CreateCalendarDto, UpdateCalendarDto } from './dto';

export interface ICalendarRepository {
  findByUserIdOrderedBySortedPin(
    userId: string,
    showAll: boolean,
  ): Promise<CalendarEntity[]>;

  findById(calendarId: number): Promise<CalendarEntity | null>;

  create(dto: CreateCalendarDto): Promise<CalendarEntity>;

  update(dto: UpdateCalendarDto): Promise<CalendarEntity>;
}
