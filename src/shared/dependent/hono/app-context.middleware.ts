import { CalendarRoutes } from '@app/calendar/core/calendar.routes.ts';
import { TaskRoutes } from '@app/task/core/task.routes.ts';
import { TodoRoutes } from '@app/todo/core/todo.routes.ts';
import { Context } from 'hono';
import { HonoEnv } from '@shared/dependent/hono/server-hono.ts';
import { CalendarRepository } from '@app/calendar/dependent/calendar.repository.ts';
import { TaskRepository } from '@app/task/dependent/task.repository.ts';
import { TodoRepository } from '@app/todo/dependent/todo.repository.ts';
import { CalendarService } from '@app/calendar/core/calendar.service.ts';
import { TaskService } from '@app/task/core/task.service.ts';
import { TodoService } from '@app/todo/core/todo.service.ts';
import { createMiddleware } from 'hono/factory';

export type AppContext = {
  calendarRoutes: CalendarRoutes;
  taskRoutes: TaskRoutes;
  todoRoutes: TodoRoutes;
};

export const createAppContext = (c: Context<HonoEnv>): AppContext => {
  const prisma = c.get('prisma');

  const calendarRepository = new CalendarRepository(prisma);
  const taskRepository = new TaskRepository(prisma);
  const todoRepository = new TodoRepository(prisma);

  const calendarService = new CalendarService(calendarRepository);
  const taskService = new TaskService(taskRepository);
  const todoService = new TodoService(todoRepository, calendarService);

  const calendarRoutes = new CalendarRoutes(
    calendarService,
    taskService,
    todoService,
  );
  const taskRoutes = new TaskRoutes(taskService, calendarService, todoService);
  const todoRoutes = new TodoRoutes(todoService, calendarService, taskService);

  return {
    calendarRoutes,
    taskRoutes,
    todoRoutes,
  };
};

export const appContextMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const ctx = createAppContext(c);
    c.set('ctx', ctx);
    await next();
  },
);
