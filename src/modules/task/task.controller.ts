import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { TCalendarSDK, TNewDoneTask } from '../../sdk/types';
import { CalendarService } from '../calendar/calendar.service';
import { CalendarRepository } from '../calendar/calendar.repository';
import { TodoService } from '../todo/todo.service';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import { CreateTaskDto, ReadCalendarDateDto, UpdateTaskDto } from './dto';

@UseGuards(AccessTokenGuard)
@Controller('/calendars/:cid/date')
export class TaskController {
  private calendarService: CalendarService;

  constructor(
    private readonly service: TaskService,
    private calendarRepository: CalendarRepository,
    private readonly todoService: TodoService,
  ) {
    this.calendarService = new CalendarService(this.calendarRepository);
  }

  @Post()
  async create(
    @Body() body: any,
    @Param('cid') paramCalendarId: string,
  ): Promise<TNewDoneTask> {
    const dto = CreateTaskDto.fromBody(paramCalendarId, body);

    const createdTask = await this.service.createDoneTask(dto);

    return createdTask.toTNewDoneTask();
  }

  @Get(':date')
  async read(
    // @Body() body: any,
    @Param('cid') paramCalendarId: string,
    @Param('date') date: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarSDK.ReadDateResponse> {
    // TODO: Responds with both Tasks and Todos...
    const dto = ReadCalendarDateDto.fromBody(paramCalendarId, date, user);

    // BL
    const calendar = await this.calendarService.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const undoneTodos = await this.todoService.findUndoneTodosByCalendar(
      calendar.id,
      dto.date,
    );

    const doneTasks = await this.service.findTasksFromCalendarAndDate(
      dto.calendarId,
      dto.date,
    );

    return {
      calendar: calendar.toTCalendarRcd(),
      date: dto.date,
      doneTasks: doneTasks.map((doneTask) => doneTask.toTNewDoneTask()),
      todos: undoneTodos.map((todo) => todo.toTNewTodo()),
    };
  }

  @Post(':tid')
  async update(
    @Body() body: any,
    @Param('cid') paramCalendarId: string,
    @Param('tid') paramTaskId: string,
  ): Promise<TNewDoneTask> {
    const dto = UpdateTaskDto.fromBody(paramCalendarId, paramTaskId, body);

    const updatedTask = await this.service.updateTaskNotesByDate(dto);

    return updatedTask.toTNewDoneTask();
  }
}
