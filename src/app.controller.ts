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
import {
  get_optional_bool,
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
import { TaskService } from './task.service';

@Controller()
export class AppController {
  constructor(
    private prismaService: PrismaService,
    private taskService: TaskService,
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

    const dbUndoneTodos =
      await this.prismaService.readUndoneTodosByCalendars(dbCalendarIds);

    // Response
    const response: TCalendarSDK.ReadPlannedEventsResponse = {
      dates: [],
    };
    let currDateI: null | number = null;
    for (let i = 0; i < dbUndoneTodos.length; ++i) {
      const todo = dbUndoneTodos[i];
      const todoDate = todo['date'];
      if (currDateI === null || response.dates[currDateI].date !== todoDate) {
        currDateI = response.dates.length;
        response.dates.push({
          date: todoDate,
          calendars: [],
        });
      }
      const todoCalendar = dbCalendars.find(
        (dbCalendar) => dbCalendar.id === todo.calendar_id,
      )!;
      let currDateCalendarI: null | number = null;
      for (let j = 0; j < response.dates[currDateI].calendars.length; j++) {
        const v = response.dates[currDateI].calendars[j];
        if (v.id === todoCalendar.id) {
          currDateCalendarI = j;
        }
      }
      if (currDateCalendarI === null) {
        currDateCalendarI = response.dates[currDateI].calendars.length;
        response.dates[currDateI].calendars.push({
          id: todoCalendar.id,
          name: todoCalendar.name,
          color: todoCalendar.color,
          plannedColor: todoCalendar.planned_color,
          usesNotes: todoCalendar.uses_notes || undefined,
          todos: [],
        });
      }
      response.dates[currDateI].calendars[currDateCalendarI].todos.push({
        id: todo.id,
        // date: todoDate,
        notes: todo.notes || undefined,
      });
    }
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
        bodyParams,
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

    const dbUndoneTodos = await this.prismaService.readUndoneTodosByCalendars([
      dbCalendar.id,
    ]);

    const tasks = await this.taskService.readTasksFromCalendar(
      bodyParams,
      calendarId,
    );

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

  @Post('/calendars-create')
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

  @Post('/calendar-update')
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
    const there_are_some_notes_in_calendar =
      await this.prismaService.calendar_there_are_some_notes_in_it(calendarId);
    if (there_are_some_notes_in_calendar) {
      // TODO: This is a leak if user is not the Calendar owner
      return 'calendar-uses-notes-cannot-be-disabled';
    }

    if (!usesNotes) {
      // Calendar "Uses Notes" cannot be disabled if it contains Notes.
      const checkTasksWithNotes = await this.taskService.areThereTasksWithNotes(
        bodyParams,
        calendarId,
      );
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

    const dbUndoneTodos = await this.prismaService.readUndoneTodosByCalendar(
      dbCalendar.id,
      date,
    );

    const doneTasks = await this.taskService.readTasksFromCalendarAndDate(
      bodyParams,
      calendarId,
      date,
    );

    // Response
    const todos = dbUndoneTodos.map((todo) => ({
      id: todo.id,
      notes: todo.notes || undefined,
    }));

    /*
    // Validity test +
    const phpTodos = phpResponse.todos.map((todx) => ({
      id: todx.id,
      notes: todx.notes || undefined,
    }));
    const jsonOracle = JSON.stringify(phpTodos);
    const jsonTest = JSON.stringify(todos);
    if (jsonOracle !== jsonTest) {
      console.error('diff 3', jsonOracle, jsonTest);
    }
    // Validity test -
    */

    const response: TCalendarSDK.ReadDateResponse = {
      calendar: {
        id: dbCalendar.id,
        name: dbCalendar.name,
        color: dbCalendar.color,
        plannedColor: dbCalendar.planned_color,
        usesNotes: dbCalendar.uses_notes || undefined,
      },
      date,
      doneTasks: doneTasks.map((doneTask) => ({
        id: doneTask.id,
        notes: doneTask.notes || undefined,
      })),
      todos,
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

    // BL
    await this.taskService.createDoneTask(bodyParams, calendarId, {
      date,
      notes: notes || undefined,
    });

    // Response
    return 'ok';
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

    // BL
    await this.taskService.updateTaskNotesByDate(bodyParams, calendarId, date, {
      notes: notes || undefined,
    });

    // Response
    return 'ok';
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

    // BL
    const insTodo = await this.prismaService.todo.create({
      data: {
        calendar_id: calendarId,
        date: date,
        done_date: null,
        notes: notes || undefined,
        // missed: undefined,
      },
    });
    // TODO: Verify calendar is user's
    console.log('created', insTodo);

    // Response
    return 'ok';
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

    // BL
    const dbTodo = await this.prismaService.readTodo(calendarId, todoId);
    if (!dbTodo) {
      throw new BadRequestException('Todo not found');
    }
    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do Notes can't be updated after it's Done.
      throw new BadRequestException('Todo already done');
    }

    const updTodo = await this.prismaService.todo.update({
      where: {
        id: todoId,
        calendar_id: calendarId,
      },
      data: {
        notes: notes || null,
      },
    });
    console.log('updated', updTodo);

    // Response
    return 'ok';
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

    // BL
    const dbTodo = await this.prismaService.readTodo(calendarId, todoId);
    if (!dbTodo) {
      throw new BadRequestException('Todo not found');
    }
    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do can't be MOVED after it's Done.
      throw new BadRequestException('Todo already done');
    }

    if (dbTodo.date !== date) {
      const updTodo = await this.prismaService.todo.update({
        where: {
          id: todoId,
          calendar_id: calendarId,
        },
        data: {
          date,
        },
      });
      console.log('updated', updTodo);
      // TODO: There could be multiple ToDos on the same day
    }
    // Otherwise, pointless update...

    /*
    // TODO: Deprecated
    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .movePlannedEvent(calendarId, todoId, date)
      .then(JSON.stringify);
    */

    // Response
    return 'ok';
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

      // BL
      const dbTodo = await this.prismaService.readTodo(calendarId, todoId);
      if (!dbTodo) {
        throw new BadRequestException('Todo not found');
      }
      // TODO: Verify calendar is user's

      const todayDate = dbTodo.date; // Always using the To-do Date as "default".
      const updTodo = await this.prismaService.todo.update({
        where: {
          id: dbTodo.id,
        },
        data: {
          done_date: todayDate,
          // TODO: To-do set as Done ambiguity: "notes" become NULL or kept?
          notes: notes || undefined,
        },
      });
      console.log('updated', updTodo);

      await this.taskService.createDoneTask(bodyParams, calendarId, {
        date: dbTodo.date,
        notes: updTodo.notes || undefined,
      });

      return 'ok';
    } else if (mode === 'missed') {
      // FIXME: Disable this function on frontend as well
      throw new BadRequestException('Deprecated');

      /*
      // TODO: Deprecated
      // Forward
      return (await getSDK(this.prismaService, this.configService, bodyParams))
        .setPlannedEventAsDone(calendarId, todoId, {
          type: 'missed',
        })
        .then(JSON.stringify);
      */
    } else {
      // Should never happen.
      throw new BadRequestException("Param 'mode' invalid");
    }
  }
}
