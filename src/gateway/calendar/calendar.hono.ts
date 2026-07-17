import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono';
import { authMiddleware } from '@dep/hono/middleware/auth.middleware';
import { prismaMiddleware } from '@dep/hono/middleware/prisma.middleware';
import { appContextMiddleware } from '@dep/hono/middleware/app-context.middleware';
import { CalendarRoutes } from './calendar.routes';
import { ReadCalendarsGdtoSchema, UpdateCalendarGdtoSchema } from './gdto';

const app = new Hono<HonoEnv>();

app.use('*', authMiddleware);
app.use('*', prismaMiddleware);
app.use('*', appContextMiddleware);

app.get('/calendars', async (c) => {
  const calendarRoutes: CalendarRoutes = c.get('ctx').calendarRoutes;
  const user = c.get('user');
  const query = c.req.query();

  const gdto = ReadCalendarsGdtoSchema.parse(query);

  const response = await calendarRoutes.readAll(gdto, user);

  return c.json(response);
});

app.post('/calendars', async (c) => {
  const calendarRoutes: CalendarRoutes = c.get('ctx').calendarRoutes;
  const user = c.get('user');
  const body = await c.req.json();

  const response = await calendarRoutes.create(body, user);

  return c.json(response);
});

app.get('/calendars/:id', async (c) => {
  const calendarRoutes: CalendarRoutes = c.get('ctx').calendarRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');

  const response = await calendarRoutes.read(paramCalendarId, user);

  return c.json(response);
});

app.post('/calendars/:id', async (c) => {
  const calendarRoutes: CalendarRoutes = c.get('ctx').calendarRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const gdto = UpdateCalendarGdtoSchema.parse(body);

  const response = await calendarRoutes.update(paramCalendarId, gdto, user);

  return c.json(response);
});

export const calendarApp = app;
