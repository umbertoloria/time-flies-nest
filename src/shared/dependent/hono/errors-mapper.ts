import type { Context } from 'hono';
import { HonoEnv } from './server-hono';

export const getKoResponse = (
  mapError2StatusCode: Map<Function, number>,
  err: Error,
  c: Context<HonoEnv>,
) => {
  const status = mapError2StatusCode.get(err.constructor);

  if (status) {
    return c.json(
      {
        statusCode: status,
        error: getHttpErrorName(status),
        message: err.message,
      },
      status as any,
    );
  }

  return undefined;
};

export function getHttpErrorName(status: number): string {
  const names: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
  };
  return names[status] || 'Internal Server Error';
}
