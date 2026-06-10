import { ReadCalendarsGdto, UpdateCalendarGdto } from '../dependent/gdto';
import {
  CreateCalendarDto,
  ReadCalendarDto,
  ReadCalendarsDto,
  UpdateCalendarDto,
} from './dto';
import { CalendarRto } from './rto';
import { CalendarUsesNotesCannotBeDisabledError } from './errors';
import { CalendarService } from './calendar.service';
import { TodoService } from '@app/todo/core/todo.service';
import { TaskService } from '@app/task/core/task.service';
import { TCalendarPrev } from '@core/sdk/types';
import { TaskRto } from '@app/task/core/rto';
import { TodoRto } from '@app/todo/core/rto';

export class CalendarRoutes {
  constructor(
    private calendarService: CalendarService,
    private taskService: TaskService,
    private todoService: TodoService,
  ) {}

  async readAll(gdto: ReadCalendarsGdto, user: ReqUser) {
    const dto = ReadCalendarsDto.fromGateway(gdto, user);

    // BL
    const calendars =
      await this.calendarService.readCalendarIDsFromUserIdViaSortedPin(
        dto.user.id,
        dto.showAll,
      );
    const calendarIds = calendars.map((calendar) => calendar.id);

    const undoneTodos =
      await this.todoService.findUndoneTodosByCalendars(calendarIds);
    const mapCalendar2Todos = calendarIds.map((calendarId) => ({
      calendarId,
      todoDates: undoneTodos
        .filter((todo) => todo.calendarId === calendarId)
        .map((todo) => todo.date),
    }));

    const mapCalendar2DoneTasks =
      await this.taskService.findTasksDatesFromCalendars(
        dto.dateFrom,
        calendarIds,
      );

    // Response
    return calendars.map<TCalendarPrev>((calendar) => {
      const doneTaskDates = mapCalendar2DoneTasks.find(
        (task) => task.calendarId === calendar.id,
      )!.dates;
      const todoDates = mapCalendar2Todos.find(
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
    const dto = CreateCalendarDto.fromBody(body, user);

    const createdCalendar = await this.calendarService.createCalendar(dto);

    return CalendarRto.fromEntity(createdCalendar).toTCalendarRcd();
  }

  async read(paramCalendarId: string, user: ReqUser) {
    const dto = ReadCalendarDto.fromParam(paramCalendarId, user);

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
    const dto = UpdateCalendarDto.fromParam(paramCalendarId, gdto, user);

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
