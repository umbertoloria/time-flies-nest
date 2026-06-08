import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { createHonoServer } from '@shared/dependent/hono/server-hono';
import { todoApp } from '@app/todo/dependent/todo.hono';
import { calendarApp } from '@app/calendar/dependent/calendar.hono';
import { taskApp } from '@app/task/dependent/task.hono';
import { mapAppError2StatusCode } from '@shared/core/errors';
import {
  getHttpErrorName,
  getKoResponse,
} from '@shared/dependent/hono/errors-handler';
import { mapCalendarError2StatusCode } from '@app/calendar/core/errors';
import { mapTaskError2StatusCode } from '@app/task/core/errors';
import { mapTodoError2StatusCode } from '@app/todo/core/errors';

const app = createHonoServer();

app.route('', todoApp);
app.route('', calendarApp);
app.route('', taskApp);

export const mapError2StatusCode = new Map<Function, number>([
  ...mapAppError2StatusCode,
  ...mapCalendarError2StatusCode,
  ...mapTaskError2StatusCode,
  ...mapTodoError2StatusCode,
]);

app.onError((err, c) => {
  console.error(`Hono Error: ${err.message}`);

  const koResponse = getKoResponse(mapError2StatusCode, err, c);
  if (koResponse) {
    return koResponse;
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        statusCode: err.status,
        error: getHttpErrorName(err.status),
        message: err.message,
      },
      err.status,
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        statusCode: 400,
        error: getHttpErrorName(400),
        message: JSON.parse(err.message),
      },
      400,
    );
  }

  return c.json(
    {
      statusCode: 500,
      error: 'Internal Server Error',
      message: err.message,
    },
    500,
  );
});

export default app;
