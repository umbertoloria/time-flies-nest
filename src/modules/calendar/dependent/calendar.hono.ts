import { Hono } from 'hono';
import { HonoEnv } from '@shared/dependent/hono/server-hono';
import { ReadCalendarsGdtoSchema, UpdateCalendarGdtoSchema } from './gdto';

const app = new Hono<HonoEnv>();

app.get('/calendars', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const query = c.req.query();

  const gdto = ReadCalendarsGdtoSchema.parse(query);

  const response = await ctx.calendarRoutes.readAll(gdto, user);

  return c.json(response);
});

app.post('/calendars', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const body = await c.req.json();

  const response = await ctx.calendarRoutes.create(body, user);

  return c.json(response);
});

app.get('/calendars/:id', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');

  const response = await ctx.calendarRoutes.read(paramCalendarId, user);

  return c.json(response);
});

app.post('/calendars/:id', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const gdto = UpdateCalendarGdtoSchema.parse(body);

  const response = await ctx.calendarRoutes.update(paramCalendarId, gdto, user);

  return c.json(response);
});

export const calendarApp = app;
