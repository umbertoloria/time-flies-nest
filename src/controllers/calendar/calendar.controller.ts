import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { validate_int } from '../../lib/validate';
import { CalendarService } from './calendar.service';
import { TodoService } from '../todo/todo.service';
import { TaskService } from '../task/task.service';
import { TCalendar, TCalendarPrev, TDay } from '../../sdk/types';
import { AuthGuard, CurrentUser } from '../../guards/auth.guard';
import {
  CreateCalendarDto,
  ReadCalendarsDto,
  UpdateCalendarDto,
} from '../../calendar/dto';

@UseGuards(AuthGuard)
@Controller('calendars')
export class CalendarController {
  constructor(
    //
    private calendarService: CalendarService,
    private todoService: TodoService,
    private taskService: TaskService,
  ) {}

  @Post('/')
  async readCalendars(
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = ReadCalendarsDto.fromBody(body, user);

    // BL
    const dbCalendars =
      await this.calendarService.readCalendarIDsFromUserIdViaSortedPin(
        dto.user.id,
        dto.showAll,
      );
    const dbCalendarIds = dbCalendars.map((calendar) => calendar.id);

    const dbUndoneTodos =
      await this.todoService.readUndoneTodosByCalendars(dbCalendarIds);
    const mapCalendar2Todos = dbCalendarIds.map((calendarId) => ({
      calendarId,
      todoDates: dbUndoneTodos
        .filter((todo) => todo.calendar_id === calendarId)
        .map((todo) => todo.date),
    }));

    const mapCalendar2DoneTasks =
      await this.taskService.readTasksDatesFromCalendars(
        dto.dateFrom,
        dbCalendarIds,
      );

    // Response
    const response: { calendars: TCalendarPrev[] } = {
      calendars: dbCalendars.map<TCalendarPrev>((dbCalendar) => {
        const doneTaskDates = mapCalendar2DoneTasks.find(
          ({ calendarId }) => calendarId === dbCalendar.id,
        )!.dates;
        const todoDates = mapCalendar2Todos.find(
          ({ calendarId }) => calendarId === dbCalendar.id,
        )!.todoDates;

        return {
          id: dbCalendar.id,
          name: dbCalendar.name,
          color: dbCalendar.color,
          plannedColor: dbCalendar.planned_color,
          usesNotes: dbCalendar.uses_notes || undefined,
          doneTaskDates,
          todoDates,
        };
      }),
    };
    return JSON.stringify(response);
  }

  @Post('/create')
  async createCalendar(
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = CreateCalendarDto.fromBody(body, user);

    // BL
    const createdCalendar = await this.calendarService.createCalendar(dto);

    // Response
    return JSON.stringify({
      id: createdCalendar.id,
    });
  }

  @Post('/update')
  async updateCalendar(
    @Body() bodyParams: any,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = UpdateCalendarDto.fromBody(bodyParams, user);

    // BL
    if (!dto.usesNotes) {
      // Calendar "Uses Notes" cannot be disabled if it contains Notes...

      // ... from Todos.
      const there_are_some_notes_in_calendar =
        await this.todoService.areThereTodosWithNotes(dto.calendarId);
      if (there_are_some_notes_in_calendar) {
        // TODO: This is a leak if user is not the Calendar owner
        return 'calendar-uses-notes-cannot-be-disabled';
      }

      // ... from (Done) Tasks.
      const checkTasksWithNotes = await this.taskService.areThereTasksWithNotes(
        dto.calendarId,
      );
      if (checkTasksWithNotes === 'calendar-uses-notes-cannot-be-disabled') {
        return 'calendar-uses-notes-cannot-be-disabled';
      } else if (checkTasksWithNotes !== 'ok') {
        throw new InternalServerErrorException('Err 3');
      }
    }

    await this.calendarService.updateCalendar(dto);

    // Response
    return 'ok-updated';
  }

  @Post('/:cid')
  async readCalendarById(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');

    // BL
    const dbCalendar = await this.calendarService.readCalendarByIDAndUser(
      calendarId,
      user.id,
    );
    if (!dbCalendar) {
      throw new NotFoundException('Calendar not found');
    }

    const dbUndoneTodos = await this.todoService.readUndoneTodosByCalendars([
      dbCalendar.id,
    ]);

    const tasks = await this.taskService.readTasksFromCalendar(calendarId);

    // Response
    const plannedDays = dbUndoneTodos.map((todo) => ({
      date: todo.date,
      notes: todo.notes || undefined,
    }));

    const response: TCalendar = {
      id: dbCalendar.id,
      name: dbCalendar.name,
      color: dbCalendar.color,
      plannedColor: dbCalendar.planned_color,
      usesNotes: dbCalendar.uses_notes || undefined,
      days: tasks.map<TDay>((task) => ({
        date: task.date,
        notes: task.notes || undefined,
      })),
      plannedDays,
    };
    return JSON.stringify(response);
  }
}
