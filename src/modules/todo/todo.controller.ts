import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { get_required_string } from '../../lib/validate';
import { CalendarService } from '../calendar/calendar.service';
import { TodoService } from './todo.service';
import { TaskService } from '../task/task.service';
import { TCalendarSDK } from '../../sdk/types';
import { AuthGuard, CurrentUser } from '../../guards/auth.guard';
import {
  CreateTodoDto,
  MoveTodoDto,
  ReadStreamlineDto,
  UpdateDoneOrMissedTodoDto,
  UpdateTodoDto,
} from './dto';

@UseGuards(AuthGuard)
@Controller('/calendars')
export class TodoController {
  constructor(
    private service: TodoService,
    private calendarService: CalendarService,
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
      await this.service.readUndoneTodosByCalendars(dbCalendarIds);

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

    const insTodo = await this.service.createTodo(dto);
    console.log('created', insTodo);

    return 'ok';
  }

  @Post('/:cid/todo-upd/:tid')
  async updateTodoNotes(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = UpdateTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const dbTodo = await this.service.readTodo(dto.calendarId, dto.todoId);

    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do Notes can't be updated after it's Done.
      throw new BadRequestException('Todo already done');
    }

    const updTodo = await this.service.updateTodoNotes(dto);
    console.log('updated', updTodo);

    // Response
    return 'ok';
  }

  @Post('/:cid/todo-move/:tid')
  async moveTodo(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = MoveTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const dbTodo = await this.service.readTodo(dto.calendarId, dto.todoId);

    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do can't be MOVED after it's Done.
      throw new BadRequestException('Todo already done');
    }

    if (dbTodo.date !== dto.date) {
      const updTodo = await this.service.moveTodo(dto);
      console.log('updated', updTodo);
      // TODO: There could be multiple ToDos on the same day
    }
    // Otherwise, pointless update...

    // Response
    return 'ok';
  }

  @Post('/:cid/todo-done/:tid')
  async doneOrMissedTodo(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    // TODO: Clean this exclusive support to "done"
    const mode = get_required_string(body, 'mode');
    if (mode !== 'done') {
      // Should never happen.
      throw new BadRequestException("Param 'mode' invalid");
    }

    const dto = UpdateDoneOrMissedTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const updTodo = await this.service.updateTaskSetAsDone(dto);
    console.log('updated', updTodo);

    await this.taskService.createDoneTask(updTodo.calendar_id, {
      date: updTodo.date,
      notes: updTodo.notes || undefined,
    });

    return 'ok';
  }
}
