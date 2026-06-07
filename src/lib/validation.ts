import { z } from 'zod';

export const zBoolean = (msg: string) =>
  z.preprocess((value) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  }, z.boolean(msg));

export const zLocalDate = (msg: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg);
