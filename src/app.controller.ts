import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { getSDK } from './remote/sdk';
import { ConfigService } from '@nestjs/config';
import {
  get_optional_bool,
  get_optional_color,
  get_optional_string,
  get_required_bool,
  get_required_color,
  get_required_int,
  get_required_local_date,
  get_required_string,
  validate_date,
  validate_int,
} from './lib/validate';
import { PrismaService } from './prisma.service';
import { requireAuth } from './auth';
import {
  TAuthStatus,
  TCalendar,
  TCalendarPrev,
  TCalendarSDK,
  TDay,
} from './remote/types';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  @Post('/auth/login')
  async authLogin(@Body() bodyParams: any): Promise<string> {
    // Validation
    const email = get_required_string(bodyParams, 'email');
    const password = get_required_string(bodyParams, 'password');

    // BL
    const dbUser = await this.prismaService.userLogin(email, password);
    if (!dbUser) {
      throw new UnauthorizedException('No session found');
    }
    return 'ok-login';
  }

  @Post('/auth/status')
  async authStatus(@Body() bodyParams: any): Promise<string> {
    // Auth
    const dbUser = await requireAuth(this.prismaService, bodyParams);

    // Response
    const response: TAuthStatus = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
      },
    };
    return JSON.stringify(response);
  }

  @Post('/streamline')
  async streamlineRead(@Body() bodyParams: any): Promise<string> {
    // Auth
    const dbUser = await requireAuth(this.prismaService, bodyParams);

    // BL
    const dbCalendars =
      await this.prismaService.readCalendarIDsFromUserIdViaSortedPin(
        dbUser.id,
        true,
      );
    const dbCalendarIds = dbCalendars.map((calendar) => calendar.id);

    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readStreamline(dbCalendarIds);
    if (!phpResponse) {
      throw new InternalServerErrorException();
    }

    // Response
    const response: TCalendarSDK.ReadPlannedEventsResponse = {
      dates: phpResponse.dates.map(({ date, calendars }) => ({
        date,
        calendars: calendars.map(({ api_calendar_id, todos }) => {
          const dbCalendar = dbCalendars.find(
            (dbCalendar) => dbCalendar.id === api_calendar_id,
          )!;
          return {
            id: dbCalendar.id,
            name: dbCalendar.name,
            color: dbCalendar.color,
            plannedColor: dbCalendar.planned_color,
            usesNotes: dbCalendar.uses_notes || undefined,
            todos: todos.map((todo) => ({
              id: todo.id,
              notes: todo.notes || undefined,
            })),
          };
        }),
      })),
    };
    return JSON.stringify(response);
  }

  @Post('/calendars')
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

    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readCalendars({
      dateFrom,
      calendarIds: dbCalendarIds,
    });

    // Response
    const response: { calendars: TCalendarPrev[] } = {
      calendars: dbCalendars.map<TCalendarPrev>((dbCalendar) => {
        const { done_tasks, todos } = phpResponse.api_calendars.find(
          ({ cid }) => cid === dbCalendar.id,
        )!;
        return {
          id: dbCalendar.id,
          name: dbCalendar.name,
          color: dbCalendar.color,
          plannedColor: dbCalendar.planned_color,
          usesNotes: dbCalendar.uses_notes || undefined,
          doneTaskDates: done_tasks.map(({ date }) => date),
          todoDates: todos.map(({ date }) => date),
        };
      }),
    };
    return JSON.stringify(response);
  }

  @Post('/calendars/:cid')
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

    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readCalendarByID(calendarId);
    if (phpResponse === 'unable' || typeof phpResponse !== 'object') {
      throw new InternalServerErrorException();
    }

    // Response
    const response: TCalendar = {
      id: dbCalendar.id,
      name: dbCalendar.name,
      color: dbCalendar.color,
      plannedColor: dbCalendar.planned_color,
      usesNotes: dbCalendar.uses_notes || undefined,
      days: phpResponse.api_calendar.done_tasks.map<TDay>((done_task) => ({
        date: done_task.date,
        notes: done_task.notes || undefined,
      })),
      plannedDays: phpResponse.api_calendar.todos.map<TDay>((todo) => ({
        date: todo.date,
        notes: todo.notes || undefined,
      })),
    };
    return JSON.stringify(response);
  }

  @Post('/calendars-create')
  async createCalendar(@Body() bodyParams: any): Promise<string> {
    // Validation
    const name = get_required_string(bodyParams, 'name');
    const color = get_required_color(bodyParams, 'color');
    const plannedColor = get_required_color(bodyParams, 'planned-color');
    const usesNotes = get_required_bool(bodyParams, 'uses-notes');

    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .createCalendar({
        name,
        color,
        plannedColor,
        usesNotes,
      })
      .then(JSON.stringify);
  }

  @Post('/calendar-update')
  async updateCalendar(@Body() bodyParams: any): Promise<string> {
    // Validation
    const calendarId = get_required_int(bodyParams, 'cid');
    const name = get_optional_string(bodyParams, 'name');
    const color = get_optional_color(bodyParams, 'color');
    const plannedColor = get_optional_color(bodyParams, 'planned-color');
    const usesNotes = get_optional_bool(bodyParams, 'uses-notes');

    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .updateCalendar(calendarId, {
        name: name,
        color,
        plannedColor,
        usesNotes,
      })
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date/:date')
  async readCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
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

    // PHP API
    const phpResponse = await (
      await getSDK(this.prismaService, this.configService, bodyParams)
    ).readCalendarDate(calendarId, date);
    if (!phpResponse) {
      throw new InternalServerErrorException();
    }

    // Response
    const response: TCalendarSDK.ReadDateResponse = {
      calendar: {
        id: dbCalendar.id,
        name: dbCalendar.name,
        color: dbCalendar.color,
        plannedColor: dbCalendar.planned_color,
        usesNotes: dbCalendar.uses_notes || undefined,
      },
      date,
      doneTasks: phpResponse.doneTasks.map((doneTask) => ({
        id: doneTask.id,
        notes: doneTask.notes || undefined,
      })),
      todos: phpResponse.todos.map((todo) => ({
        id: todo.id,
        notes: todo.notes || undefined,
      })),
    };
    return JSON.stringify(response);
  }

  @Post('/calendars/:cid/date-create/:date')
  async createCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') urlDate: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const date = validate_date(urlDate, 'Invalid Date');
    // TODO: Validate "date"
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .createCalendarDate(calendarId, date, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date-upd-notes/:date')
  async updateCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .updateCalendarDateNotes(calendarId, date, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-create/:date')
  async createTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .createPlannedEvent(calendarId, date, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-upd/:tid')
  async updateTodoNotes(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .updatePlannedEvent(calendarId, todoId, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-move/:tid')
  async moveTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const date = get_required_local_date(bodyParams, 'date');

    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .movePlannedEvent(calendarId, todoId, date)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-done/:tid')
  async doneOrMissedTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const mode = get_required_string(bodyParams, 'mode');
    if (mode === 'done') {
      // Validation
      const notes = get_optional_string(bodyParams, 'notes');

      // Forward
      return (await getSDK(this.prismaService, this.configService, bodyParams))
        .setPlannedEventAsDone(calendarId, todoId, {
          type: 'done',
          notes,
        })
        .then(JSON.stringify);
    } else if (mode === 'missed') {
      // Forward
      return (await getSDK(this.prismaService, this.configService, bodyParams))
        .setPlannedEventAsDone(calendarId, todoId, {
          type: 'missed',
        })
        .then(JSON.stringify);
    } else {
      // Should never happen.
      throw new BadRequestException("Param 'mode' invalid");
    }
  }
}
