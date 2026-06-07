import { CreateCalendarDto, ReadCalendarDto, ReadCalendarsDto } from './dto';
import { ReadCalendarsGdto } from './gdto';
import { CalendarService } from './calendar.service';
import { TodoService } from '../todo/todo.service';
import { TaskService } from '../task/task.service';
import { TCalendarPrev } from '../../sdk/types';

export class CalendarRoutes {
  constructor(
    private service: CalendarService,
    private todoService: TodoService,
    private taskService: TaskService,
  ) {}

  async readAll(gdto: ReadCalendarsGdto, user: ReqUser) {
    const dto = ReadCalendarsDto.fromGateway(gdto, user);

    // BL
    const calendars = await this.service.readCalendarIDsFromUserIdViaSortedPin(
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
        ...calendar.toTCalendarRcd(),
        doneTaskDates,
        todoDates,
      };
    });
  }

  async create(body: any, user: ReqUser) {
    const dto = CreateCalendarDto.fromBody(body, user);

    const createdCalendar = await this.service.createCalendar(dto);

    return createdCalendar.toTCalendarRcd();
  }

  async read(paramCalendarId: string, user: ReqUser) {
    const dto = ReadCalendarDto.fromParam(paramCalendarId, user);

    // BL
    const calendar = await this.service.findCalendarFromUser(
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
      days: tasks.map((task) => task.toTDayWithId()),
      plannedDays: undoneTodos.map((todo) => todo.toTDayWithId()),
    };
  }
}
