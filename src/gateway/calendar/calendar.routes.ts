import {
  dtoFromReadCalendarsGdto,
  dtoFromUpdateCalendarGdto,
  ReadCalendarsGdto,
  UpdateCalendarGdto,
} from '@gateway/calendar/gdto';
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
import { excludeDuplicates, getIds } from '@core/lib/extract';

export class CalendarRoutes {
  constructor(
    private calendarService: CalendarService,
    private taskService: TaskService,
    private todoService: TodoService,
  ) {}

  async readAll(gdto: ReadCalendarsGdto, user: ReqUser) {
    const dto = dtoFromReadCalendarsGdto(gdto, user);

    // BL
    const calendars =
      await this.calendarService.readUserCalendarsUsingSortedPin(
        dto.user.id,
        dto.showAll,
      );
    const calendarIds = getIds(calendars);

    const [undoneTodos, doneTasks] = await Promise.all([
      this.todoService.findUndoneTodosByCalendars(calendarIds),
      this.taskService.findTasksDatesFromCalendars(dto.dateFrom, calendarIds),
    ]);
    // TODO: Improve indexing
    const mapCalendar2UndoneTodoDates = calendarIds.map((calendarId) => ({
      calendarId,
      todoDates: undoneTodos
        .filter((todo) => todo.calendarId === calendarId)
        .map((todo) => todo.date),
    }));
    const mapCalendar2DoneTaskDates = calendarIds.map((calendarId) => ({
      calendarId,
      dates: excludeDuplicates(
        doneTasks
          .filter((task) => task.calendarId === calendarId)
          .map((task) => task.date),
      ),
    }));

    // Response
    return calendars.map<TCalendarPrev>((calendar) => {
      const doneTaskDates = mapCalendar2DoneTaskDates.find(
        (task) => task.calendarId === calendar.id,
      )!.dates;
      const todoDates = mapCalendar2UndoneTodoDates.find(
        (todo) => todo.calendarId === calendar.id,
      )!.todoDates;

      return {
        ...CalendarRto.fromEntity(calendar).toTCalendarRcd(),
        doneTaskDates,
        todoDates,
      };
    });
  }

  async create(body: any, user: ReqUser) {
    const dto = createCreateCalendarDtoFromBody(body, user);

    const createdCalendar = await this.calendarService.createCalendar(dto);

    return CalendarRto.fromEntity(createdCalendar).toTCalendarRcd();
  }

  async read(paramCalendarId: string, user: ReqUser) {
    const dto = createReadCalendarDtoFromParam(paramCalendarId, user);

    // BL
    const calendar = await this.calendarService.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const undoneTodos = await this.todoService.findUndoneTodosByCalendars([
      calendar.id,
    ]);

    const tasks = await this.taskService.findTasksFromCalendar(dto.calendarId);

    // Response
    return {
      ...calendar,
      days: tasks.map((task) => TaskRto.fromEntity(task).toTDayWithId()),
      plannedDays: undoneTodos.map((todo) =>
        TodoRto.fromEntity(todo).toTDayWithId(),
      ),
    };
  }

  async update(
    paramCalendarId: string,
    gdto: UpdateCalendarGdto,
    user: ReqUser,
  ) {
    const dto = dtoFromUpdateCalendarGdto(paramCalendarId, gdto, user);

    // BL
    if (!dto.usesNotes) {
      // Calendar "Uses Notes" cannot be disabled if it contains Notes...

      // ... from Todos.
      const areThereTodosWithNotesInCalendar =
        await this.todoService.areThereTodosWithNotes(dto.calendarId);
      if (areThereTodosWithNotesInCalendar) {
        // TODO: This is a leak if user is not the Calendar owner
        throw new CalendarUsesNotesCannotBeDisabledError();
      }

      // ... from (Done) Tasks.
      const areThereTasksWithNotesInCalendar =
        await this.taskService.areThereTasksWithNotes(dto.calendarId);
      if (areThereTasksWithNotesInCalendar) {
        throw new CalendarUsesNotesCannotBeDisabledError();
      }
    }

    const updatedCalendar = await this.calendarService.updateCalendar(dto);

    return CalendarRto.fromEntity(updatedCalendar).toTCalendarRcd();
  }
}
