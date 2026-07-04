import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono';
import { TodoRoutes } from './todo.routes';

const app = new Hono<HonoEnv>();

app.get('/calendars/streamline', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');
  const paramIncludeArchivedCalendars = c.req.query('includeArchivedCalendars');

  const response = await todoRoutes.readStreamline(
    paramIncludeArchivedCalendars,
    user,
  );

  return c.json(response);
});

app.post('/calendars/:id/todos', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const response = await todoRoutes.create(paramCalendarId, body, user);

  return c.json(response);
});

app.post('/calendars/:id/todos/:tid', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTodoId = c.req.param('tid');
  const body = await c.req.json();

  const response = await todoRoutes.updateTodoNotes(
    paramCalendarId,
    paramTodoId,
    body,
    user,
  );

  return c.json(response);
});

app.post('/calendars/:id/todos/:tid/set-as-done', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTodoId = c.req.param('tid');

  const response = await todoRoutes.updateTodoSetAsDone(
    paramCalendarId,
    paramTodoId,
    user,
  );

  return c.json(response);
});

export const todoApp = app;
