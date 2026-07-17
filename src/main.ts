import { mapAppError2StatusCode } from '@core/errors';
import { mapCalendarError2StatusCode } from '@app/calendar/errors';
import { mapTaskError2StatusCode } from '@app/task/errors';
import { mapTodoError2StatusCode } from '@app/todo/errors';
import { createHonoServer } from '@dep/hono';
import { todoApp } from '@gateway/todo/todo.hono';
import { calendarApp } from '@gateway/calendar/calendar.hono';
import { taskApp } from '@gateway/task/task.hono';
import { healthApp } from '@dep/hono/endpoints/health.hono';

export const mapError2StatusCode = new Map<Function, number>([
  ...mapAppError2StatusCode,
  ...mapCalendarError2StatusCode,
  ...mapTaskError2StatusCode,
  ...mapTodoError2StatusCode,
]);

const app = createHonoServer(mapError2StatusCode);

app.route('', todoApp);
app.route('', calendarApp);
app.route('', taskApp);
app.route('', healthApp);

export default app;
