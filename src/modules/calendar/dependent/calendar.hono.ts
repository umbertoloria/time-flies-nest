import { Hono } from 'hono';
import { HonoEnv } from '@shared/dependent/hono/server-hono';
import { createModuleErrorHandler } from '@shared/dependent/hono/errors-handler';
import { calendarRoutes } from '../core/calendar.routes';
import {
  CalendarNotFoundError,
  CalendarUsesNotesCannotBeDisabledError,
} from '../core/errors';
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

const mapError2StatusCode = new Map<Function, number>([
  [CalendarNotFoundError, 404],
  [CalendarUsesNotesCannotBeDisabledError, 400],
]);
app.onError(createModuleErrorHandler(mapError2StatusCode));

export const calendarApp = app;
