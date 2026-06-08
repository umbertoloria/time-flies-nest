import { Hono } from 'hono';
import { HonoEnv } from '../../../common/dependent/hono/server-hono';
import { calendarRoutes } from '../core/calendar.routes';
import { ReadCalendarsGdtoSchema, UpdateCalendarGdtoSchema } from './gdto';

const app = new Hono<HonoEnv>();

app.get('/calendars', async (c) => {
  const user = c.get('user');
  const query = c.req.query();

  const gdto = ReadCalendarsGdtoSchema.parse(query);

  const response = await calendarRoutes.readAll(gdto, user);

  return c.json(response);
});

app.post('/calendars', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const response = await calendarRoutes.create(body, user);

  return c.json(response);
});

app.get('/calendars/:id', async (c) => {
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');

  const response = await calendarRoutes.read(paramCalendarId, user);

  return c.json(response);
});

app.post('/calendars/:id', async (c) => {
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const gdto = UpdateCalendarGdtoSchema.parse(body);

  const response = await calendarRoutes.update(paramCalendarId, gdto, user);

  return c.json(response);
});

export const calendarApp = app;
