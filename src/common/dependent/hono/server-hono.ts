import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { calendarRoutes } from '../../../modules/calendar/core/calendar.routes';
import {
  ReadCalendarsGdtoSchema,
  UpdateCalendarGdtoSchema,
} from '../../../modules/calendar/dependent/gdto';
import { taskRoutes } from '../../../modules/task/core/task.routes';
import { todoRoutes } from '../../../modules/todo/core/todo.routes';
import { authMiddleware } from './auth.middleware';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '../../core/errors';
import {
  CalendarNotFoundError,
  CalendarUsesNotesCannotBeDisabledError,
} from '../../../modules/calendar/core/errors';
import { TaskNotFoundError } from '../../../modules/task/core/errors';
import {
  TodoAlreadyDoneError,
  TodoNotFoundError,
} from '../../../modules/todo/core/errors';
import { getConfigs } from '../configs';

export type HonoEnv = {
  Variables: {
    user: ReqUser;
  };
};

export function startHonoServer() {
  const app = new Hono<HonoEnv>();

  app.use(
    '*',
    cors({
      origin: getConfigs().corsAllowedOrigins,
      allowHeaders: ['Content-Type', 'Authorization'],
      // allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowMethods: ['GET', 'POST'],
      credentials: true,
    }),
  );

  app.use('*', authMiddleware);

  const errorStatusMap = new Map<Function, number>([
    // Common
    [BadRequestError, 400],
    [UnauthorizedError, 401],
    [ForbiddenError, 403],
    // Domain-specific
    [CalendarNotFoundError, 404],
    [CalendarUsesNotesCannotBeDisabledError, 400],
    [TaskNotFoundError, 404],
    [TodoNotFoundError, 404],
    [TodoAlreadyDoneError, 400],
  ]);

  function getHttpErrorName(status: number): string {
    const names: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
    };
    return names[status] || 'Internal Server Error';
  }

  app.onError((err, c) => {
    console.error(`Hono Error: ${err.message}`);

    if (err instanceof HTTPException) {
      return c.json(
        {
          statusCode: err.status,
          error: getHttpErrorName(err.status),
          message: err.message,
        },
        err.status,
      );
    }

    if (err instanceof ZodError) {
      return c.json(
        {
          statusCode: 400,
          error: getHttpErrorName(400),
          message: JSON.parse(err.message),
        },
        400,
      );
    }

    const mappedStatus = errorStatusMap.get(err.constructor);
    if (mappedStatus) {
      return c.json(
        {
          statusCode: mappedStatus,
          error: getHttpErrorName(mappedStatus),
          message: err.message,
        },
        mappedStatus as any,
      );
    }

    return c.json(
      {
        statusCode: 500,
        message: err.message,
      },
      500,
    );
  });

  // ---------------- TOD0 ROUTES ---------------- //
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

  // ---------------- CALENDAR ROUTES ---------------- //
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

  // ---------------- TASK ROUTES ---------------- //
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

  serve(
    {
      fetch: app.fetch,
      port: getConfigs().port,
    },
    (info) => {
      const { address, port } = info;
      console.log(`Application is running on: http://${address}:${port}`);
    },
  );
}
