import { CalendarRoutes } from '@gateway/calendar/calendar.routes';
import { TaskRoutes } from '@gateway/task/task.routes';
import { TodoRoutes } from '@gateway/todo/todo.routes';
import { createMiddleware } from 'hono/factory';
import { HonoEnv } from '@dep/hono';
import { Context } from 'hono';
import { CalendarRepository } from '@database/calendar/calendar.repository';
import { TaskRepository } from '@database/task/task.repository';
import { TodoRepository } from '@database/todo/todo.repository';
import { CalendarService } from '@app/calendar/calendar.service';
import { CalendarAuthz } from '@app/calendar/calendar.authz';
import { TaskService } from '@app/task/task.service';
import { TodoService } from '@app/todo/todo.service';
import { Authz } from '@gateway/authz';

export type AppContext = {
  calendarRoutes: CalendarRoutes;
  taskRoutes: TaskRoutes;
  todoRoutes: TodoRoutes;
};

export const appContextMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const ctx = createAppContext(c);
    c.set('ctx', ctx);
    await next();
  },
);

const createAppContext = (c: Context<HonoEnv>): AppContext => {
  const prisma = c.get('prisma');

  const calendarRepository = new CalendarRepository(prisma);
  const taskRepository = new TaskRepository(prisma);
  const todoRepository = new TodoRepository(prisma);

  const calendarService = new CalendarService(calendarRepository);
  const calendarAuthz = new CalendarAuthz(calendarRepository);
  const taskService = new TaskService(taskRepository);
  const todoService = new TodoService(todoRepository);

  const authz = new Authz(calendarAuthz, taskService, todoService);
  const calendarRoutes = new CalendarRoutes(
    calendarAuthz,
    calendarService,
    taskService,
    todoService,
  );
  const taskRoutes = new TaskRoutes(authz, taskService, todoService);
  const todoRoutes = new TodoRoutes(authz, todoService, taskService);

  return {
    calendarRoutes,
    taskRoutes,
    todoRoutes,
  };
};
