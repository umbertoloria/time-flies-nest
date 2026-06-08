import { z } from 'zod';
import {
  zBoolean,
  zHexColor,
} from '../../../../common/dependent/validation/validation';

export const UpdateCalendarGdtoSchema = z.object({
  name: z.string().min(1, 'Invalid "name" param: must be a string'),
  color: zHexColor('Invalid "color" param: must be a color'),
  plannedColor: zHexColor('Invalid "plannedColor" param: must be a color'),
  usesNotes: zBoolean('Invalid "usesNotes" param: must be a boolean'),
});

export type UpdateCalendarGdto = z.infer<typeof UpdateCalendarGdtoSchema>;
