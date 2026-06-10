import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono';
import { TodoRoutes } from '@app/todo/core/todo.routes';

const app = new Hono<HonoEnv>();

app.get('/calendars/streamline', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');

  const response = await todoRoutes.readStreamline(user);

  return c.json(response);
});

app.post('/calendars/:id/todo', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const response = await todoRoutes.create(paramCalendarId, body, user);

  return c.json(response);
});

app.post('/calendars/:id/todo/:tid/update-notes', async (c) => {
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

app.post('/calendars/:id/todo/:tid/move', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTodoId = c.req.param('tid');
  const body = await c.req.json();

  const response = await todoRoutes.moveTodo(
    paramCalendarId,
    paramTodoId,
    body,
    user,
  );

  return c.json(response);
});

app.post('/calendars/:id/todo/:tid/set-as-done', async (c) => {
  const todoRoutes: TodoRoutes = c.get('ctx').todoRoutes;
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTodoId = c.req.param('tid');
  const body = await c.req.json();

  const response = await todoRoutes.updateTodoSetAsDone(
    paramCalendarId,
    paramTodoId,
    body,
    user,
  );

  return c.json(response);
});

export const todoApp = app;
