import { TodoEntity } from '../entity';
import { TNewTodo } from '@core/sdk/types';

export class TodoRto {
  constructor(
    public readonly id: number,
    public readonly calendarId: number,
    public readonly date?: string,
    public readonly doneDate?: string,
    public readonly notes?: string,
  ) {}

  static fromEntity(entity: TodoEntity) {
    return new TodoRto(
      entity.id,
      entity.calendarId,
      entity.date ?? undefined,
      entity.doneDate ?? undefined,
      entity.notes ?? undefined,
    );
  }

  toTNewTodo(): TNewTodo {
    return {
      id: this.id,
      notes: this.notes,
    };
  }
}
