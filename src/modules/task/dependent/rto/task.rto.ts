import { Task } from '@shared/dependent/prisma.repository';
import { TDay, TNewDoneTask } from '@shared/core/sdk/types';

export class TaskRto {
  constructor(
    public readonly id: number,
    public readonly calendarId: number,
    public readonly date: string,
    public readonly notes?: string,
  ) {}

  static fromEntity(entity: Task) {
    return new TaskRto(
      entity.id,
      entity.calendar_id,
      entity.date,
      entity.notes ?? undefined,
    );
  }

  toTNewDoneTask(): TNewDoneTask {
    return {
      id: this.id,
      notes: this.notes,
    };
  }

  toTDayWithId(): TDay {
    return {
      date: this.date,
      notes: this.notes,
      taskId: this.id,
    };
  }
}
