import { Hono } from 'hono';
import { HonoEnv } from '@shared/dependent/hono/server-hono';
import { createModuleErrorHandler } from '@shared/dependent/hono/errors-handler';
import { taskRoutes } from '../core/task.routes';
import { mapTaskError2StatusCode } from '../core/errors';

const app = new Hono<HonoEnv>();

app.post('/calendars/:id/date', async (c) => {
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const response = await taskRoutes.create(paramCalendarId, body, user);

  return c.json(response);
});

app.get('/calendars/:id/date/:date', async (c) => {
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramDate = c.req.param('date');

  const response = await taskRoutes.read(paramCalendarId, paramDate, user);

  return c.json(response);
});

app.post('/calendars/:id/date/:tid', async (c) => {
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTaskId = c.req.param('tid');
  const body = await c.req.json();

  const response = await taskRoutes.update(
    paramCalendarId,
    paramTaskId,
    body,
    user,
  );

  return c.json(response);
});

app.onError(createModuleErrorHandler(mapTaskError2StatusCode));

export const taskApp = app;
