import { Task } from '@dep/prisma';
import { TaskEntity } from '@app/task/entity';

export const entityFromTask = (record: Task): TaskEntity => ({
  id: record.id,
  calendarId: record.calendar_id,
  date: record.date,
  notes: record.notes ?? undefined,
});

export const entitiesFromTasks = (records: Task[]) =>
  records.map(entityFromTask);

export const entityFromTaskOrNull = (record?: Task | null) =>
  record ? entityFromTask(record) : null;
