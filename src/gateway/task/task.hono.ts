import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono';
import { authMiddleware } from '@dep/hono/middleware/auth.middleware';
import { prismaMiddleware } from '@dep/hono/middleware/prisma.middleware';
import { appContextMiddleware } from '@dep/hono/middleware/app-context.middleware';
import { TaskRoutes } from './task.routes';

const app = new Hono<HonoEnv>();

app.use('*', authMiddleware);
app.use('*', prismaMiddleware);
app.use('*', appContextMiddleware);

app.post('/calendars/:id/tasks/done', async (c) => {
  const taskRoutes: TaskRoutes = c.get('ctx').taskRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const response = await taskRoutes.create(paramCalendarId, body, user);

  return c.json(response);
});

app.get('/calendars/:id/date/:date', async (c) => {
  const taskRoutes: TaskRoutes = c.get('ctx').taskRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramDate = c.req.param('date');

  const response = await taskRoutes.read(paramCalendarId, paramDate, user);

  return c.json(response);
});

app.post('/calendars/:id/tasks/:tid', async (c) => {
  const taskRoutes: TaskRoutes = c.get('ctx').taskRoutes;
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

export const taskApp = app;
