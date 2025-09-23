import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  get_optional_string,
  get_required_local_date,
  get_required_string,
  validate_int,
} from '../lib/validate';
import { PrismaService } from '../prisma.service';
import { TaskService } from '../task.service';
import { requireAuth } from '../auth';
import { TCalendarSDK } from '../remote/types';

@Controller('/calendars')
export class TodoController {
  constructor(
    //
    private prismaService: PrismaService,
    private taskService: TaskService,
  ) {}

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

  @Post('/:cid/todo-create/:date')
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

  @Post('/:cid/todo-upd/:tid')
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
      throw new NotFoundException('Todo not found');
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

  @Post('/:cid/todo-move/:tid')
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
      throw new NotFoundException('Todo not found');
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

  @Post('/:cid/todo-done/:tid')
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
        throw new NotFoundException('Todo not found');
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

      await this.taskService.createDoneTask(calendarId, {
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
