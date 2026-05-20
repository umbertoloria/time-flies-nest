import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  get_optional_string,
  get_required_local_date,
  get_required_string,
  validate_int,
} from '../../lib/validate';
import { CalendarService } from '../calendar/calendar.service';
import { TodoService } from './todo.service';
import { TaskService } from '../task/task.service';
import { TCalendarSDK } from '../../sdk/types';
import { AuthGuard, CurrentUser } from '../../guards/auth.guard';
import { CreateTodoDto, ReadStreamlineDto } from '../../todo/dto';

@UseGuards(AuthGuard)
@Controller('/calendars')
export class TodoController {
  constructor(
    //
    private calendarService: CalendarService,
    private todoService: TodoService,
    private taskService: TaskService,
  ) {}

  @Post('/streamline')
  async streamlineRead(@CurrentUser() user: ReqUser): Promise<string> {
    const dto = ReadStreamlineDto.fromBody(user);

    // BL
    const dbCalendars =
      await this.calendarService.readCalendarIDsFromUserIdViaSortedPin(
        dto.user.id,
        true,
      );
    const dbCalendarIds = dbCalendars.map((calendar) => calendar.id);

    const dbUndoneTodos =
      await this.todoService.readUndoneTodosByCalendars(dbCalendarIds);

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
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = CreateTodoDto.fromBody(urlCid, date, body, user);

    // BL
    const insTodo = await this.todoService.createTodo(dto);
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
    const dbTodo = await this.todoService.readTodo(calendarId, todoId);
    if (!dbTodo) {
      throw new NotFoundException('Todo not found');
    }
    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do Notes can't be updated after it's Done.
      throw new BadRequestException('Todo already done');
    }

    const updTodo = await this.todoService.updateTodoNotes(
      todoId,
      calendarId,
      notes || null,
    );
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
    const dbTodo = await this.todoService.readTodo(calendarId, todoId);
    if (!dbTodo) {
      throw new NotFoundException('Todo not found');
    }
    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do can't be MOVED after it's Done.
      throw new BadRequestException('Todo already done');
    }

    if (dbTodo.date !== date) {
      const updTodo = await this.todoService.moveTodo(todoId, calendarId, date);
      console.log('updated', updTodo);
      // TODO: There could be multiple ToDos on the same day
    }
    // Otherwise, pointless update...

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
      const dbTodo = await this.todoService.readTodo(calendarId, todoId);
      if (!dbTodo) {
        throw new NotFoundException('Todo not found');
      }
      // TODO: Verify calendar is user's

      const todayDate = dbTodo.date; // Always using the To-do Date as "default".
      const updTodo = await this.todoService.updateTaskSetAsDone(
        dbTodo.id,
        todayDate,
        notes || null,
      );
      console.log('updated', updTodo);

      await this.taskService.createDoneTask(calendarId, {
        date: dbTodo.date,
        notes: updTodo.notes || undefined,
      });

      return 'ok';
    } else if (mode === 'missed') {
      // FIXME: Disable this function on frontend as well
      throw new BadRequestException('Deprecated');
    } else {
      // Should never happen.
      throw new BadRequestException("Param 'mode' invalid");
    }
  }
}
