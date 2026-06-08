import { Hono } from 'hono';
import { HonoEnv } from '@shared/dependent/hono/server-hono';
import { createModuleErrorHandler } from '@shared/dependent/hono/errors-handler';
import { todoRoutes } from '../core/todo.routes';
import { TodoAlreadyDoneError, TodoNotFoundError } from '../core/errors';

const app = new Hono<HonoEnv>();

app.get('/calendars/streamline', async (c) => {
  const user = c.get('user');

  const response = await todoRoutes.readStreamline(user);

  return c.json(response);
});

app.post('/calendars/:id/todo', async (c) => {
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const response = await todoRoutes.create(paramCalendarId, body, user);

  return c.json(response);
});

app.post('/calendars/:id/todo/:tid/update-notes', async (c) => {
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

const mapError2StatusCode = new Map<Function, number>([
  [TodoNotFoundError, 404],
  [TodoAlreadyDoneError, 400],
]);
app.onError(createModuleErrorHandler(mapError2StatusCode));

export const todoApp = app;
