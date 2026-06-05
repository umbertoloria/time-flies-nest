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
import { TCalendarSDK, TNewDoneTask, TNewTodo } from '../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import { createIdxItemsAndIds } from '../../lib/idx';
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
    const calendars =
      await this.calendarService.readCalendarIDsFromUserIdViaSortedPin(
        dto.user.id,
        true,
      );
    const { idx: idxCalendars, ids: calendarIds } =
      createIdxItemsAndIds(calendars);

    const undoneTodos =
      await this.service.findUndoneTodosByCalendars(calendarIds);

    // Response
    const response: TCalendarSDK.ReadPlannedEventsResponse = {
      dates: [],
    };
    let currDateI: null | number = null;
    for (let i = 0; i < undoneTodos.length; ++i) {
      const todo = undoneTodos[i];
      const todoDate = todo['date'];
      if (currDateI === null || response.dates[currDateI].date !== todoDate) {
        currDateI = response.dates.length;
        response.dates.push({
          date: todoDate,
          calendars: [],
        });
      }
      const todoCalendar = idxCalendars[todo.calendarId]!;
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

  @Post('/:cid/todo/:tid/update-notes')
  async updateTodoNotes(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = UpdateTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const todo = await this.service.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

    // TODO: Verify calendar is user's
    if (todo.done_date) {
      // To-do Notes can't be updated after it's Done.
      throw new BadRequestException('Todo already done');
    }

    const updTodo = await this.service.updateTodoNotes(dto);
    console.log('updated', updTodo);

    // Response
    return updTodo.toTNewTodo();
  }

  @Post('/:cid/todo/:tid/move')
  async moveTodo(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = MoveTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const todo = await this.service.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

    // TODO: Verify calendar is user's
    if (todo.done_date) {
      // To-do can't be MOVED after it's Done.
      throw new BadRequestException('Todo already done');
    }

    if (todo.date !== dto.date) {
      const updTodo = await this.service.moveTodo(dto);
      console.log('updated', updTodo);
      // TODO: There could be multiple ToDos on the same day

      return updTodo.toTNewTodo();
    }
    // Otherwise, pointless update...

    // Response
    return todo.toTNewTodo();
  }

  @Post('/:cid/todo/:tid/set-as-done')
  async updateTodoSetAsDone(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewDoneTask> {
    const dto = UpdateDoneTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const updTodo = await this.service.updateTodoSetAsDone(dto);

    const createTaskDto = CreateTaskDto.fromTodoSetAsDone(updTodo);
    const createdDoneTask =
      await this.taskService.createDoneTask(createTaskDto);

    return createdDoneTask.toTNewDoneTask();
  }
}
