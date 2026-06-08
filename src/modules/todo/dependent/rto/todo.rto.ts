import { Todo } from '../../../../prisma.repository';
import { TDay, TNewTodo } from '../../../../sdk/types';

export class TodoRto {
  constructor(
    public readonly id: number,
    public readonly calendarId: number,
    public readonly date: string,
    public readonly doneDate?: string,
    public readonly notes?: string,
  ) {}

  static fromEntity(entity: Todo) {
    return new TodoRto(
      entity.id,
      entity.calendar_id,
      entity.date,
      entity.done_date ?? undefined,
      entity.notes ?? undefined,
    );
  }

  toTNewTodo(): TNewTodo {
    return {
      id: this.id,
      notes: this.notes,
    };
  }

  toTDayWithId(): TDay {
    return {
      date: this.date,
      notes: this.notes,
      todoId: this.id,
    };
  }
}
