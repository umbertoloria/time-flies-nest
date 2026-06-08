import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { corsAllowedOrigins } from '../main';
import { calendarRoutes } from '../modules/calendar/core/calendar.routes';
import {
  ReadCalendarsGdtoSchema,
  UpdateCalendarGdtoSchema,
} from '../modules/calendar/dependent/gdto';
import { taskRoutes } from '../modules/task/core/task.routes';
import { authMiddleware } from './auth-hono.middleware';

export type HonoEnv = {
  Variables: {
    user: ReqUser;
  };
};

export function startHonoServer(port: number) {
  const app = new Hono<HonoEnv>();

  app.use(
    '*',
    cors({
      origin: corsAllowedOrigins,
      allowHeaders: ['Content-Type', 'Authorization'],
      // allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowMethods: ['GET', 'POST'],
      credentials: true,
    }),
  );

  app.use('*', authMiddleware);

  app.onError((err, c) => {
    console.error(`❌ Hono Error: ${err.message}`);
    return c.json(
      {
        statusCode: 500,
        message: err.message,
      },
      500,
    );
  });

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

  // FIXME: Add the others

  console.log(`🚀 Hono Server listening on port ${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
}
