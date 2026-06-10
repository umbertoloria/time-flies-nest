import { Hono } from 'hono';
import { HonoEnv } from '@dep/hono/server-hono';

const app = new Hono<HonoEnv>();

app.get('/calendars/streamline', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');

  const response = await ctx.todoRoutes.readStreamline(user);

  return c.json(response);
});

app.post('/calendars/:id/todo', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const body = await c.req.json();

  const response = await ctx.todoRoutes.create(paramCalendarId, body, user);

  return c.json(response);
});

app.post('/calendars/:id/todo/:tid/update-notes', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTodoId = c.req.param('tid');
  const body = await c.req.json();

  const response = await ctx.todoRoutes.updateTodoNotes(
    paramCalendarId,
    paramTodoId,
    body,
    user,
  );

  return c.json(response);
});

app.post('/calendars/:id/todo/:tid/move', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTodoId = c.req.param('tid');
  const body = await c.req.json();

  const response = await ctx.todoRoutes.moveTodo(
    paramCalendarId,
    paramTodoId,
    body,
    user,
  );

  return c.json(response);
});

app.post('/calendars/:id/todo/:tid/set-as-done', async (c) => {
  const ctx = c.get('ctx');
  const user = c.get('user');
  const paramCalendarId = c.req.param('id');
  const paramTodoId = c.req.param('tid');
  const body = await c.req.json();

  const response = await ctx.todoRoutes.updateTodoSetAsDone(
    paramCalendarId,
    paramTodoId,
    body,
    user,
  );

  return c.json(response);
});

export const todoApp = app;
