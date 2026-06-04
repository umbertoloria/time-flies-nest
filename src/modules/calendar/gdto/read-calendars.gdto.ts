import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReadCalendarsGdto {
  // TODO: Improve Date validation
  @IsString()
  readonly dateFrom: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  readonly showAll?: boolean;
}
