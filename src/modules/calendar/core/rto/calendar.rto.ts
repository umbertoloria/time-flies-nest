import { CalendarEntity } from '../entity';
import { TCalendarRcd } from '@core/sdk/types';

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

  static fromEntity(entity: CalendarEntity) {
    return new CalendarRto(
      entity.id,
      entity.userId,
      entity.name,
      entity.color,
      entity.plannedColor,
      entity.usesNotes ?? undefined,
      entity.sortedPin ?? undefined,
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
