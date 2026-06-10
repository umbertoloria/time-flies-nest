import { TCalendarSDK, TNewDoneTask, TNewTodo } from '@core/sdk/types';
import {
  excludeDuplicates,
  getIds,
  getValuesFromList,
} from '@core/lib/extract';
import { CreateTaskDto } from '@app/task/core/dto';
import {
  CreateTodoDto,
  MoveTodoDto,
  ReadStreamlineDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoService } from './todo.service';
import { CalendarService } from '@app/calendar/core/calendar.service';
import { TaskService } from '@app/task/core/task.service';
import { TodoAlreadyDoneError } from './errors';
import { CalendarRto } from '@app/calendar/core/rto';

export class TodoRoutes {
  constructor(
    private todoService: TodoService,
    private calendarService: CalendarService,
    private taskService: TaskService,
  ) {}

  async readStreamline(
    user: ReqUser,
  ): Promise<TCalendarSDK.ReadPlannedEventsResponse> {
    const dto = ReadStreamlineDto.fromBody(user);

    // BL
    const calendars =
      await this.calendarService.readCalendarIDsFromUserIdViaSortedPin(
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
                      ? dateCalendarUndoneTodos.map((todo) => todo.toTNewTodo())
                      : undefined,
                    doneTasks: dateCalendarDoneTasks.length
                      ? dateCalendarDoneTasks.map((task) =>
                          task.toTNewDoneTask(),
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

  async create(
    paramCalendarId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = CreateTodoDto.fromBody(paramCalendarId, body, user);

    const insTodo = await this.todoService.createTodo(dto);
    console.log('created', insTodo);

    return insTodo.toTNewTodo();
  }

  async updateTodoNotes(
    paramCalendarId: string,
    paramTodoId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = UpdateTodoDto.fromBody(
      paramCalendarId,
      paramTodoId,
      body,
      user,
    );

    // BL
    const todo = await this.todoService.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

    // TODO: Verify calendar is user's
    if (todo.doneDate) {
      // To-do Notes can't be updated after it's Done.
      throw new TodoAlreadyDoneError();
    }

    const updTodo = await this.todoService.updateTodoNotes(dto);
    console.log('updated', updTodo);

    // Response
    return updTodo.toTNewTodo();
  }

  async moveTodo(
    paramCalendarId: string,
    paramTodoId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = MoveTodoDto.fromBody(paramCalendarId, paramTodoId, body, user);

    // BL
    const todo = await this.todoService.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

    // TODO: Verify calendar is user's
    if (todo.doneDate) {
      // To-do can't be MOVED after it's Done.
      throw new TodoAlreadyDoneError();
    }

    if (todo.date !== dto.date) {
      const updTodo = await this.todoService.moveTodo(dto);
      console.log('updated', updTodo);
      // TODO: There could be multiple ToDos on the same day

      return updTodo.toTNewTodo();
    }
    // Otherwise, pointless update...

    // Response
    return todo.toTNewTodo();
  }

  async updateTodoSetAsDone(
    paramCalendarId: string,
    paramTodoId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewDoneTask> {
    const dto = UpdateDoneTodoDto.fromBody(
      paramCalendarId,
      paramTodoId,
      body,
      user,
    );

    // BL
    const updTodo = await this.todoService.updateTodoSetAsDone(dto);

    const createTaskDto = CreateTaskDto.fromTodoSetAsDone(updTodo);
    const createdDoneTask =
      await this.taskService.createDoneTask(createTaskDto);

    return createdDoneTask.toTNewDoneTask();
  }
}
