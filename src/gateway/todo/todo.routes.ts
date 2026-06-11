import { TCalendarSDK, TNewDoneTask, TNewTodo } from '@core/sdk/types';
import { excludeDuplicates, getIds, getValuesFromList } from '@core/utils';
import { TodoService } from '@app/todo/todo.service';
import { CalendarService } from '@app/calendar/calendar.service';
import { TaskService } from '@app/task/task.service';
import { CalendarRto } from '@app/calendar/rto';
import { TaskRto } from '@app/task/rto';
import { TodoRto } from '@app/todo/rto';
import {
  createCreateTaskDtoFromTodoSetAsDone,
  createCreateTodoDtoFromBody,
  createMoveTodoDtoFromBody,
  createReadStreamlineFromBody,
  createUpdateDoneTodoDtoFromBody,
  createUpdateTodoDtoFromBody,
} from './dto-mapper';
import { TraceMethod } from '@core/trace';

export class TodoRoutes {
  constructor(
    private todoService: TodoService,
    private calendarService: CalendarService,
    private taskService: TaskService,
  ) {}

  @TraceMethod()
  async readStreamline(
    user: ReqUser,
  ): Promise<TCalendarSDK.ReadPlannedEventsResponse> {
    const dto = createReadStreamlineFromBody(user);

    // BL
    const calendars =
      await this.calendarService.readUserCalendarsUsingSortedPin(
        dto.user.id,
        true,
      );
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

    // Response
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

    const updTodo = await this.todoService.updateTodoNotes(dto);
    console.log('updated', updTodo);

    // Response
    return TodoRto.fromEntity(updTodo).toTNewTodo();
  }

  @TraceMethod()
  async moveTodo(
    paramCalendarId: string,
    paramTodoId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = createMoveTodoDtoFromBody(
      paramCalendarId,
      paramTodoId,
      body,
      user,
    );

    const todo = await this.todoService.moveTodo(dto);

    // Response
    return TodoRto.fromEntity(todo).toTNewTodo();
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

    // BL
    const updTodo = await this.todoService.updateTodoSetAsDone(dto);

    const createTaskDto = createCreateTaskDtoFromTodoSetAsDone(updTodo);
    const createdDoneTask =
      await this.taskService.createDoneTask(createTaskDto);

    return TaskRto.fromEntity(createdDoneTask).toTNewDoneTask();
  }
}
