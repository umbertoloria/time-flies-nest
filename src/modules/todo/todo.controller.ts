import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from '../calendar/calendar.service';
import { TodoService } from './todo.service';
import { TaskService } from '../task/task.service';
import { TCalendarSDK, TNewTodo } from '../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import {
  CreateTodoDto,
  MoveTodoDto,
  ReadStreamlineDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { CreateTaskDto } from '../task/dto';

@UseGuards(AccessTokenGuard)
@Controller('/calendars')
export class TodoController {
  constructor(
    private service: TodoService,
    private calendarService: CalendarService,
    private taskService: TaskService,
  ) {}

  @Get('streamline')
  async readStreamline(
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarSDK.ReadPlannedEventsResponse> {
    const dto = ReadStreamlineDto.fromBody(user);

    // BL
    const dbCalendars =
      await this.calendarService.readCalendarIDsFromUserIdViaSortedPin(
        dto.user.id,
        true,
      );
    const dbCalendarIds = dbCalendars.map((calendar) => calendar.id);

    const dbUndoneTodos =
      await this.service.findUndoneTodosByCalendars(dbCalendarIds);

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
    return response;
  }

  @Post(':cid/todo')
  async create(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = CreateTodoDto.fromBody(urlCid, body, user);

    const insTodo = await this.service.createTodo(dto);
    console.log('created', insTodo);

    return insTodo.toTNewTodo();
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
    const dbTodo = await this.service.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

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
    const dbTodo = await this.service.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

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
  async updateTodoSetAsDone(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = UpdateDoneTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const updTodo = await this.service.updateTodoSetAsDone(dto);

    const createTaskDto = CreateTaskDto.fromTodoSetAsDone(updTodo);
    await this.taskService.createDoneTask(createTaskDto);

    return 'ok';
  }
}
