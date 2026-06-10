import { Calendar } from '@dep/prisma';
import { CalendarEntity } from '@app/calendar/core/entity';

export const entityFromCalendar = (record: Calendar): CalendarEntity => ({
  id: record.id,
  userId: record.user_id,
  name: record.name,
  color: record.color,
  plannedColor: record.planned_color,
  usesNotes: record.uses_notes ?? undefined,
  sortedPin: record.sorted_pin ?? undefined,
});

export const entitiesFromCalendars = (records: Calendar[]) =>
  records.map(entityFromCalendar);

export const entityFromCalendarOrNull = (record?: Calendar | null) =>
  record ? entityFromCalendar(record) : null;
