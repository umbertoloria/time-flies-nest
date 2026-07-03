import { TCalendarSDK, TNewDoneTask } from '@core/sdk/types';
import { TaskService } from '@app/task/task.service';
import { Authz } from '@gateway/authz';
import { TodoService } from '@app/todo/todo.service';
import { CalendarRto } from '@app/calendar/rto';
import { TaskRto } from '@app/task/rto';
import { TodoRto } from '@app/todo/rto';
import {
  createCreateTaskDtoFromBody,
  createReadTaskDtoFromBody,
  createUpdateTaskDtoFomBody,
} from './dto-mapper';
import { TraceMethod } from '@core/trace';

export class TaskRoutes {
  constructor(
    private authz: Authz,
    private taskService: TaskService,
    private todoService: TodoService,
  ) {}

  @TraceMethod()
  async read(
    paramCalendarId: string,
    date: string,
    user: ReqUser,
  ): Promise<TCalendarSDK.ReadDateResponse> {
    const dto = createReadTaskDtoFromBody(paramCalendarId, date, user);

    const calendar = await this.authz.userOnCalendar(dto.calendarId, dto.user);

    const [undoneTodos, doneTasks] = await Promise.all([
      this.todoService.findUndoneTodosByCalendar(calendar.id, dto.date),
      this.taskService.findTasksFromCalendarAndDate(dto.calendarId, dto.date),
    ]);

    return {
      calendar: CalendarRto.fromEntity(calendar).toTCalendarRcd(),
      date: dto.date,
      doneTasks: doneTasks.map((doneTask) =>
        TaskRto.fromEntity(doneTask).toTNewDoneTask(),
      ),
      todos: undoneTodos.map((todo) => TodoRto.fromEntity(todo).toTNewTodo()),
    };
  }

  @TraceMethod()
  async create(
    paramCalendarId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewDoneTask> {
    const dto = createCreateTaskDtoFromBody(paramCalendarId, body, user);

    await this.authz.userOnCalendar(dto.calendarId, dto.user);

    const createdTask = await this.taskService.createDoneTask(dto);

    return TaskRto.fromEntity(createdTask).toTNewDoneTask();
  }

  @TraceMethod()
  async update(
    paramCalendarId: string,
    paramTaskId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewDoneTask> {
    const dto = createUpdateTaskDtoFomBody(
      paramCalendarId,
      paramTaskId,
      body,
      user,
    );

    await this.authz.userOnCalendarTask(dto.calendarId, dto.taskId, dto.user);

    const updatedTask = await this.taskService.updateTaskNotesByDate(dto);

    return TaskRto.fromEntity(updatedTask).toTNewDoneTask();
  }
}
