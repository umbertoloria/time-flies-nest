import { IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCalendarGdto {
  @IsString()
  readonly name: string;

  // TODO: Improve Color validation
  @IsString()
  readonly color: string;

  @IsString()
  readonly plannedColor: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  readonly usesNotes: boolean;
}
