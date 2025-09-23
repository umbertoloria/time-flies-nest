import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { requireAuth } from '../auth';
import {
  get_optional_bool,
  get_required_bool,
  get_required_color,
  get_required_int,
  get_required_local_date,
  get_required_string,
  validate_int,
} from '../lib/validate';
import { PrismaService } from '../prisma.service';
import { TaskService } from '../task.service';
import { TCalendar, TCalendarPrev, TDay } from '../remote/types';

@Controller('calendars')
export class CalendarController {
  constructor(
    //
    private prismaService: PrismaService,
    private taskService: TaskService,
  ) {}

  @Post('/')
  async readCalendars(@Body() bodyParams: any): Promise<string> {
    // Auth
    const dbUser = await requireAuth(this.prismaService, bodyParams);

    // Validation
    const dateFrom = get_required_local_date(bodyParams, 'date-from');
    const showAll = get_optional_bool(bodyParams, 'show-all') || false;

    // BL
    const dbCalendars =
      await this.prismaService.readCalendarIDsFromUserIdViaSortedPin(
        dbUser.id,
        showAll,
      );
    const dbCalendarIds = dbCalendars.map((calendar) => calendar.id);

    const dbUndoneTodos =
      await this.prismaService.readUndoneTodosByCalendars(dbCalendarIds);
    const mapCalendar2Todos = dbCalendarIds.map((calendarId) => ({
      calendarId,
      todoDates: dbUndoneTodos
        .filter((todo) => todo.calendar_id === calendarId)
        .map((todo) => todo.date),
    }));

    const mapCalendar2DoneTasks =
      await this.taskService.readTasksDatesFromCalendars(
        dateFrom,
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
  async createCalendar(@Body() bodyParams: any): Promise<string> {
    // Auth
    const dbUser = await requireAuth(this.prismaService, bodyParams);

    // Validation
    const name = get_required_string(bodyParams, 'name');
    const color = get_required_color(bodyParams, 'color');
    const plannedColor = get_required_color(bodyParams, 'planned-color');
    const usesNotes = get_required_bool(bodyParams, 'uses-notes');

    // BL
    const createdCalendar = await this.prismaService.createCalendar(dbUser.id, {
      name,
      color,
      plannedColor,
      usesNotes,
    });

    // Response
    return JSON.stringify({
      id: createdCalendar.id,
    });
  }

  @Post('/update')
  async updateCalendar(@Body() bodyParams: any): Promise<string> {
    // Auth
    const dbUser = await requireAuth(this.prismaService, bodyParams);

    // Validation
    const calendarId = get_required_int(bodyParams, 'cid');
    // TODO: Here every field is required
    const name = get_required_string(bodyParams, 'name');
    const color = get_required_color(bodyParams, 'color');
    const plannedColor = get_required_color(bodyParams, 'planned-color');
    const usesNotes = get_required_bool(bodyParams, 'uses-notes');

    // BL
    if (!usesNotes) {
      // Calendar "Uses Notes" cannot be disabled if it contains Notes...

      // ... from Todos.
      const there_are_some_notes_in_calendar =
        await this.prismaService.calendar_there_are_some_notes_in_its_todos(
          calendarId,
        );
      if (there_are_some_notes_in_calendar) {
        // TODO: This is a leak if user is not the Calendar owner
        return 'calendar-uses-notes-cannot-be-disabled';
      }

      // ... from (Done) Tasks.
      const checkTasksWithNotes =
        await this.taskService.areThereTasksWithNotes(calendarId);
      if (checkTasksWithNotes === 'calendar-uses-notes-cannot-be-disabled') {
        return 'calendar-uses-notes-cannot-be-disabled';
      } else if (checkTasksWithNotes !== 'ok') {
        throw new InternalServerErrorException('Err 3');
      }
    }

    const updateResponse = await this.prismaService.updateCalendar(
      calendarId,
      dbUser.id,
      {
        name,
        color,
        plannedColor,
        usesNotes,
      },
    );
    if (updateResponse === 'not-found' || typeof updateResponse !== 'object') {
      throw new NotFoundException('Calendar not found');
    }

    // Response
    return 'ok-updated';
  }

  @Post('/:cid')
  async readCalendarById(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
  ): Promise<string> {
    // Auth
    const dbUser = await requireAuth(this.prismaService, bodyParams);

    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');

    // BL
    const dbCalendar = await this.prismaService.readCalendarByIDAndUser(
      calendarId,
      dbUser.id,
    );
    if (!dbCalendar) {
      throw new NotFoundException('Calendar not found');
    }

    const dbUndoneTodos = await this.prismaService.readUndoneTodosByCalendars([
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
