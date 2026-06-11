import { z } from 'zod';
import { zBoolean, zLocalDate } from '@dep/zod';
import { validateDate } from '@core/lib/validate';
import { ReadCalendarsDto } from '@app/calendar/dto';

export const ReadCalendarsGdtoSchema = z.object({
  dateFrom: zLocalDate('Invalid "dateFrom" param: must be a date'),
  showAll: zBoolean('Invalid "showAll" param: must be a boolean').optional(),
});

export type ReadCalendarsGdto = z.infer<typeof ReadCalendarsGdtoSchema>;

export function dtoFromReadCalendarsGdto(
  gdto: ReadCalendarsGdto,
  user: ReqUser,
): ReadCalendarsDto {
  const dateFrom = validateDate(
    gdto.dateFrom,
    'Param "dateFrom" invalid: must be a date',
  );
  const showAll = gdto.showAll || false;

  return {
    dateFrom,
    showAll,
    user,
  };
}
