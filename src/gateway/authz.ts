import { CalendarAuthz } from '@app/calendar/calendar.authz';
import { TaskService } from '@app/task/task.service';
import { TodoService } from '@app/todo/todo.service';
import { CalendarEntity } from '@app/calendar/entity';
import { TaskEntity } from '@app/task/entity';
import { TodoEntity } from '@app/todo/entity';

export class Authz {
  constructor(
    private calendarAuthz: CalendarAuthz,
    private taskService: TaskService,
    private todoService: TodoService,
  ) {}

  async allUserCalendars(user: ReqUser): Promise<CalendarEntity[]> {
    return await this.calendarAuthz.findUserCalendarsAll(user);
  }

  async userOnCalendar(
    calendarId: number,
    user: ReqUser,
  ): Promise<CalendarEntity> {
    return await this.calendarAuthz.findUserOwnCalendar(calendarId, user);
  }

  async userOnCalendarTask(
    calendarId: number,
    taskId: number,
    user: ReqUser,
  ): Promise<[CalendarEntity, TaskEntity]> {
    return await Promise.all([
      this.calendarAuthz.findUserOwnCalendar(calendarId, user),
      this.taskService.findTaskValidate(calendarId, taskId),
    ]);
  }

  async userOnCalendarTodo(
    calendarId: number,
    todoId: number,
    user: ReqUser,
  ): Promise<[CalendarEntity, TodoEntity]> {
    return await Promise.all([
      this.calendarAuthz.findUserOwnCalendar(calendarId, user),
      this.todoService.findTodoValidate(calendarId, todoId),
    ]);
  }
}
