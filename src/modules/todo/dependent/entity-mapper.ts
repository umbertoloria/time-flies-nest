import { Todo } from '@dep/prisma';
import { TodoEntity } from '@app/todo/entity';

export const entityFromTodo = (record: Todo): TodoEntity => ({
  id: record.id,
  calendarId: record.calendar_id,
  date: record.date,
  notes: record.notes ?? undefined,
});

export const entitiesFromTodos = (records: Todo[]) =>
  records.map(entityFromTodo);

export const entityFromTodoOrNull = (record?: Todo | null) =>
  record ? entityFromTodo(record) : null;
