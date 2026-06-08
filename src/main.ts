import { createHonoServer } from '@shared/dependent/hono/server-hono';
import { todoApp } from '@app/todo/dependent/todo.hono';
import { calendarApp } from '@app/calendar/dependent/calendar.hono';
import { taskApp } from '@app/task/dependent/task.hono';
import { serve } from '@hono/node-server';
import { getConfigs } from '@shared/dependent/configs';

const app = createHonoServer();

app.route('', todoApp);
app.route('', calendarApp);
app.route('', taskApp);

serve(
  {
    fetch: app.fetch,
    port: getConfigs().port,
  },
  (info) => {
    const { address, port } = info;
    console.log(`Application is running on: http://${address}:${port}`);
  },
);
