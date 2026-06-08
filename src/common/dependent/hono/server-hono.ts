import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from '../../core/errors';
import { getConfigs } from '../configs';
import { authMiddleware } from './auth.middleware';
import {
  CalendarNotFoundError,
  CalendarUsesNotesCannotBeDisabledError,
} from '@app/calendar/core/errors';
import { TaskNotFoundError } from '@app/task/core/errors';
import { TodoAlreadyDoneError, TodoNotFoundError } from '@app/todo/core/errors';
import { calendarApp } from '@app/calendar/dependent/calendar.hono';
import { taskApp } from '@app/task/dependent/task.hono';
import { todoApp } from '@app/todo/dependent/todo.hono';

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

  app.route('', todoApp);
  app.route('', calendarApp);
  app.route('', taskApp);

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
