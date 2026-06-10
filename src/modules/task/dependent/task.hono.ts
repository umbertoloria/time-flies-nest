import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono';

const app = new Hono<HonoEnv>();

app.post('/calendars/:id/date', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const response = await ctx.taskRoutes.create(paramCalendarId, body, user);

  return c.json(response);
});

app.get('/calendars/:id/date/:date', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramDate = c.req.param('date');

  const response = await ctx.taskRoutes.read(paramCalendarId, paramDate, user);

  return c.json(response);
});

app.post('/calendars/:id/date/:tid', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTaskId = c.req.param('tid');
  const body = await c.req.json();

  const response = await ctx.taskRoutes.update(
    paramCalendarId,
    paramTaskId,
    body,
    user,
  );

  return c.json(response);
});

export const taskApp = app;
