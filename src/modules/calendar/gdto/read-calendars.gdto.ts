import { z } from 'zod';
import { zBoolean, zLocalDate } from '../../../lib/validation';

export const ReadCalendarsGdtoSchema = z.object({
  dateFrom: zLocalDate('Invalid "dateFrom" param: must be a date'),
  showAll: zBoolean('Invalid "showAll" param: must be a boolean').optional(),
});

export type ReadCalendarsGdto = z.infer<typeof ReadCalendarsGdtoSchema>;
