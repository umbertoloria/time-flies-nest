import { Calendar } from '../../../../common/dependent/prisma.repository';
import { TCalendarRcd } from '../../../../common/core/sdk/types';

export class CalendarRto {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly name: string,
    public readonly color: string,
    public readonly plannedColor: string,
    public readonly usesNotes?: boolean,
    public readonly sortedPin?: number,
  ) {}

  static fromEntity(entity: Calendar) {
    return new CalendarRto(
      entity.id,
      entity.user_id,
      entity.name,
      entity.color,
      entity.planned_color,
      entity.uses_notes ?? undefined,
      entity.sorted_pin ?? undefined,
    );
  }

  toTCalendarRcd(): TCalendarRcd {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      plannedColor: this.plannedColor,
      usesNotes: this.usesNotes,
    };
  }
}
