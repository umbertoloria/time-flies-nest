import {
  dtoFromReadCalendarsGdto,
  dtoFromUpdateCalendarGdto,
  ReadCalendarsGdto,
  UpdateCalendarGdto,
} from './gdto';
import { CalendarRto } from '@app/calendar/rto';
import { CalendarUsesNotesCannotBeDisabledError } from '@app/calendar/errors';
import { CalendarService } from '@app/calendar/calendar.service';
import { TodoService } from '@app/todo/todo.service';
import { TaskService } from '@app/task/task.service';
import { TCalendarPrev } from '@core/sdk/types';
import { TaskRto } from '@app/task/rto';
import { TodoRto } from '@app/todo/rto';
import {
  createCreateCalendarDtoFromBody,
  createReadCalendarDtoFromParam,
} from './dto-mapper';
import { getIds } from '@core/utils';
import { TraceMethod } from '@core/trace';

export class CalendarRoutes {
  constructor(
    private calendarService: CalendarService,
    private taskService: TaskService,
    private todoService: TodoService,
  ) {}

  @TraceMethod()
  async readAll(gdto: ReadCalendarsGdto, user: ReqUser) {
    const dto = dtoFromReadCalendarsGdto(gdto, user);

    const calendars =
      await this.calendarService.readUserCalendarsUsingSortedPin(
        dto.user.id,
        dto.showAll,
      );
    const calendarIds = getIds(calendars);

    const [mapCalendar2DoneTaskDates, mapCalendar2UndoneTodoDates] =
      await Promise.all([
        this.taskService.mapCalendarIds2DoneTaskDates(
          dto.dateFrom,
          calendarIds,
        ),
        this.todoService.mapCalendarIds2UndoneTodoDates(calendarIds),
      ]);

    return calendars.map<TCalendarPrev>((calendar) => {
      const doneTaskDates = mapCalendar2DoneTaskDates[calendar.id];
      const todoDates = mapCalendar2UndoneTodoDates[calendar.id];

      return {
        ...CalendarRto.fromEntity(calendar).toTCalendarRcd(),
        doneTaskDates,
        todoDates,
      };
    });
  }

  @TraceMethod()
  async read(paramCalendarId: string, user: ReqUser) {
    const dto = createReadCalendarDtoFromParam(paramCalendarId, user);

    const calendar = await this.calendarService.findUserCalendar(dto);

    const [undoneTodos, doneTasks] = await Promise.all([
      this.todoService.findUndoneTodosByCalendars([calendar.id]),
      this.taskService.findTasksFromCalendar(dto.calendarId),
    ]);

    return {
      ...calendar,
      days: doneTasks.map((task) => TaskRto.fromEntity(task).toTDayWithId()),
      plannedDays: undoneTodos.map((todo) =>
        TodoRto.fromEntity(todo).toTDayWithId(),
      ),
    };
  }

  @TraceMethod()
  async create(body: any, user: ReqUser) {
    const dto = createCreateCalendarDtoFromBody(body, user);

    const createdCalendar = await this.calendarService.createCalendar(dto);

    return CalendarRto.fromEntity(createdCalendar).toTCalendarRcd();
  }

  @TraceMethod()
  async update(
    paramCalendarId: string,
    gdto: UpdateCalendarGdto,
    user: ReqUser,
  ) {
    const dto = dtoFromUpdateCalendarGdto(paramCalendarId, gdto, user);

    if (!dto.usesNotes) {
      // Calendar "Uses Notes" cannot be disabled if it contains Notes...

      const [
        areThereTodosWithNotesInCalendar,
        areThereTasksWithNotesInCalendar,
      ] = await Promise.all([
        // ... from Todos.
        this.todoService.areThereTodosWithNotes(dto.calendarId),
        // ... from (Done) Tasks.
        this.taskService.areThereTasksWithNotes(dto.calendarId),
      ]);

      if (areThereTodosWithNotesInCalendar) {
        // TODO: This is a leak if user is not the Calendar owner
        throw new CalendarUsesNotesCannotBeDisabledError();
      }
      if (areThereTasksWithNotesInCalendar) {
        throw new CalendarUsesNotesCannotBeDisabledError();
      }
    }

    const updatedCalendar = await this.calendarService.updateCalendar(dto);

    return CalendarRto.fromEntity(updatedCalendar).toTCalendarRcd();
  }
}
