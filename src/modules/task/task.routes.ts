import { CreateTaskDto, ReadCalendarDateDto, UpdateTaskDto } from './dto';
import { TCalendarSDK, TNewDoneTask } from '@core/sdk/types';
import { TaskService } from './task.service';
import { CalendarService } from '@app/calendar/calendar.service';
import { TodoService } from '@app/todo/core/todo.service';
import { CalendarRto } from '@app/calendar/rto';
import { TaskRto } from '@app/task/rto';
import { TodoRto } from '@app/todo/core/rto';

export class TaskRoutes {
  constructor(
    private taskService: TaskService,
    private calendarService: CalendarService,
    private todoService: TodoService,
  ) {}

  async create(
    paramCalendarId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewDoneTask> {
    // FIXME: Ops... forgot to check if user owns the calendar...
    const dto = CreateTaskDto.fromBody(paramCalendarId, body);

    const createdTask = await this.taskService.createDoneTask(dto);

    return TaskRto.fromEntity(createdTask).toTNewDoneTask();
  }

  async read(
    paramCalendarId: string,
    date: string,
    user: ReqUser,
  ): Promise<TCalendarSDK.ReadDateResponse> {
    // TODO: Responds with both Tasks and Todos...
    const dto = ReadCalendarDateDto.fromBody(paramCalendarId, date, user);

    // BL
    const calendar = await this.calendarService.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const undoneTodos = await this.todoService.findUndoneTodosByCalendar(
      calendar.id,
      dto.date,
    );

    const doneTasks = await this.taskService.findTasksFromCalendarAndDate(
      dto.calendarId,
      dto.date,
    );

    return {
      calendar: CalendarRto.fromEntity(calendar).toTCalendarRcd(),
      date: dto.date,
      doneTasks: doneTasks.map((doneTask) =>
        TaskRto.fromEntity(doneTask).toTNewDoneTask(),
      ),
      todos: undoneTodos.map((todo) => TodoRto.fromEntity(todo).toTNewTodo()),
    };
  }

  async update(
    paramCalendarId: string,
    paramTaskId: string,
    body: any,
    user: ReqUser,
  ) {
    // FIXME: Ops... forgot to check if user owns the calendar...
    const dto = UpdateTaskDto.fromBody(paramCalendarId, paramTaskId, body);

    const updatedTask = await this.taskService.updateTaskNotesByDate(dto);

    return TaskRto.fromEntity(updatedTask).toTNewDoneTask();
  }
}
