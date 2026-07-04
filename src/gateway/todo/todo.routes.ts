import { TCalendarSDK, TNewDoneTask, TNewTodo } from '@core/sdk/types';
import { excludeDuplicates, getIds, getValuesFromList } from '@core/utils';
import { TodoService } from '@app/todo/todo.service';
import { Authz } from '@gateway/authz';
import { TaskService } from '@app/task/task.service';
import { CalendarRto } from '@app/calendar/rto';
import { TaskRto } from '@app/task/rto';
import { TodoRto } from '@app/todo/rto';
import {
  createCreateTaskDtoFromTodoSetAsDone,
  createCreateTodoDtoFromBody,
  createReadStreamlineFromBody,
  createUpdateDoneTodoDtoFromBody,
  createUpdateTodoDtoFromBody,
} from './dto-mapper';
import { TraceMethod } from '@core/trace';
import { TodoAlreadyDoneError } from '@app/todo/errors';

export class TodoRoutes {
  constructor(
    private authz: Authz,
    private todoService: TodoService,
    private taskService: TaskService,
  ) {}

  @TraceMethod()
  async readStreamline(
    user: ReqUser,
  ): Promise<TCalendarSDK.ReadPlannedEventsResponse> {
    const dto = createReadStreamlineFromBody(user);

    const calendars = await this.authz.allUserCalendars(dto.user);

    const calendarIds = getIds(calendars);
    const undoneTodos =
      await this.todoService.findUndoneTodosByCalendars(calendarIds);

    const doneTasks = undoneTodos.length
      ? await this.taskService.findTasksFromCalendarsAndDate(
          calendarIds,
          undoneTodos[0].date,
        )
      : [];

    const sortedDates = excludeDuplicates([
      ...getValuesFromList(undoneTodos, 'date'),
      ...getValuesFromList(doneTasks, 'date'),
    ]);

    return {
      dates: sortedDates.map<TCalendarSDK.ReadPlannedEventsResponseDateBox>(
        (date) => {
          const dateUndoneTodos = undoneTodos.filter(
            (todo) => todo.date === date,
          );
          const dateDoneTasks = doneTasks.filter((task) => task.date === date);
          const dateCalendarIds = excludeDuplicates([
            ...getValuesFromList(dateUndoneTodos, 'calendarId'),
            ...getValuesFromList(dateDoneTasks, 'calendarId'),
          ]);
          return {
            date,
            calendars: calendars
              .filter((calendar) => dateCalendarIds.includes(calendar.id))
              .map<TCalendarSDK.ReadPlannedEventsResponseCalendar>(
                (calendar) => {
                  const dateCalendarUndoneTodos = dateUndoneTodos.filter(
                    (todo) => todo.calendarId === calendar.id,
                  );
                  const dateCalendarDoneTasks = dateDoneTasks.filter(
                    (task) => task.calendarId === calendar.id,
                  );
                  return {
                    ...CalendarRto.fromEntity(calendar).toTCalendarRcd(),
                    sortedPin: calendar.sortedPin,
                    todos: dateCalendarUndoneTodos.length
                      ? dateCalendarUndoneTodos.map((todo) =>
                          TodoRto.fromEntity(todo).toTNewTodo(),
                        )
                      : undefined,
                    doneTasks: dateCalendarDoneTasks.length
                      ? dateCalendarDoneTasks.map((task) =>
                          TaskRto.fromEntity(task).toTNewDoneTask(),
                        )
                      : undefined,
                  };
                },
              ),
          };
        },
      ),
    };
  }

  @TraceMethod()
  async create(
    paramCalendarId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = createCreateTodoDtoFromBody(paramCalendarId, body, user);

    await this.authz.userOnCalendar(dto.calendarId, dto.user);

    const insTodo = await this.todoService.createTodo(dto);
    console.log('created', insTodo);

    return TodoRto.fromEntity(insTodo).toTNewTodo();
  }

  @TraceMethod()
  async updateTodoNotes(
    paramCalendarId: string,
    paramTodoId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = createUpdateTodoDtoFromBody(
      paramCalendarId,
      paramTodoId,
      body,
      user,
    );

    const [_, todo] = await this.authz.userOnCalendarTodo(
      dto.calendarId,
      dto.todoId,
      dto.user,
    );

    if (todo.doneDate) {
      // To-do Notes can't be updated after it's Done.
      throw new TodoAlreadyDoneError();
    }

    // Avoid pointless updates
    if (todo.date === dto.fields.date) {
      dto.fields.date = undefined;
    }
    if (
      (typeof todo.notes === 'string' && todo.notes === dto.fields.notes) ||
      (todo.notes === undefined && dto.fields.notes === null)
    ) {
      dto.fields.date = undefined;
    }
    if (dto.fields.date === undefined && dto.fields.notes === undefined) {
      return todo;
    }

    const updTodo = await this.todoService.updateTodo(dto);

    return TodoRto.fromEntity(updTodo).toTNewTodo();
  }

  @TraceMethod()
  async updateTodoSetAsDone(
    paramCalendarId: string,
    paramTodoId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewDoneTask> {
    const dto = createUpdateDoneTodoDtoFromBody(
      paramCalendarId,
      paramTodoId,
      body,
      user,
    );

    const [_, todo] = await this.authz.userOnCalendarTodo(
      dto.calendarId,
      dto.todoId,
      dto.user,
    );

    const doneDate = todo.date; // Always using the To-do Date as "default".

    const updTodo = await this.todoService.updateTodoSetAsDone(dto, doneDate);

    const createTaskDto = createCreateTaskDtoFromTodoSetAsDone(updTodo, user);
    const createdDoneTask =
      await this.taskService.createDoneTask(createTaskDto);

    return TaskRto.fromEntity(createdDoneTask).toTNewDoneTask();
  }
}
