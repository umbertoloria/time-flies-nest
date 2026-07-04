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
  createSetTodoAsDoneDtoFromValidatedFields,
  createUpdateTodoDtoFromBody,
  validateFieldsForSetTodoAsDoneDtoFromBody,
} from './dto-mapper';
import { TraceMethod } from '@core/trace';
import { TodoAlreadyDoneError } from '@app/todo/errors';
import { BadRequestError } from '@core/errors';

export class TodoRoutes {
  constructor(
    private authz: Authz,
    private todoService: TodoService,
    private taskService: TaskService,
  ) {}

  @TraceMethod()
  async readStreamline(
    paramIncludeArchivedCalendars: string | undefined,
    user: ReqUser,
  ): Promise<TCalendarSDK.ReadPlannedEventsResponse> {
    const dto = createReadStreamlineFromBody(
      paramIncludeArchivedCalendars,
      user,
    );

    const calendars = await this.authz.userCalendars(
      dto.user,
      dto.includeArchivedCalendars,
    );

    const calendarIds = getIds(calendars);
    const { plannedTodos, unplannedTodos } =
      await this.todoService.findUndoneTodosByCalendars(calendarIds);

    const doneTasks = plannedTodos.length
      ? await this.taskService.findTasksFromCalendarsAndDate(
          calendarIds,
          plannedTodos[0].date,
        )
      : [];

    const sortedDates = excludeDuplicates([
      ...getValuesFromList(plannedTodos, 'date'),
      ...getValuesFromList(doneTasks, 'date'),
    ]);

    const unplannedTodoCalendarIds = excludeDuplicates(
      getValuesFromList(unplannedTodos, 'calendarId'),
    );

    return {
      dates: sortedDates.map<TCalendarSDK.ReadPlannedEventsResponseDateBox>(
        (date) => {
          const dateUndoneTodos = plannedTodos.filter(
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
      unplannedTodosCalendars: calendars
        .filter((calendar) => unplannedTodoCalendarIds.includes(calendar.id))
        .map<TCalendarSDK.ReadUnplannedTodosCalendar>((calendar) => {
          const dateCalendarUndoneTodos = unplannedTodos.filter(
            (todo) => todo.calendarId === calendar.id,
          );
          return {
            ...CalendarRto.fromEntity(calendar).toTCalendarRcd(),
            sortedPin: calendar.sortedPin,
            todos: dateCalendarUndoneTodos.length
              ? dateCalendarUndoneTodos.map((todo) =>
                  TodoRto.fromEntity(todo).toTNewTodo(),
                )
              : undefined,
          };
        }),
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
    user: ReqUser,
  ): Promise<TNewDoneTask> {
    const validatedFields = validateFieldsForSetTodoAsDoneDtoFromBody(
      paramCalendarId,
      paramTodoId,
    );

    const [_, todo] = await this.authz.userOnCalendarTodo(
      validatedFields.calendarId,
      validatedFields.todoId,
      user,
    );

    const doneDate = todo.date; // Always using the To-do Date as "default".

    if (!doneDate) {
      // TODO: Figure out how to convert an Unplanned Todo into a DoneTask
      throw new BadRequestError('Todo does not have a Date');
    }

    const dtoSetTodoAsDone = createSetTodoAsDoneDtoFromValidatedFields(
      validatedFields,
      doneDate,
      user,
    );
    const updTodo = await this.todoService.setTodoAsDone(dtoSetTodoAsDone);

    const dtoCreateTask = createCreateTaskDtoFromTodoSetAsDone(updTodo, user);
    const createdDoneTask =
      await this.taskService.createDoneTask(dtoCreateTask);

    return TaskRto.fromEntity(createdDoneTask).toTNewDoneTask();
  }
}
