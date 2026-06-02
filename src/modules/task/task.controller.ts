import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { TCalendarSDK } from '../../sdk/types';
import { CalendarService } from '../calendar/calendar.service';
import { TodoService } from '../todo/todo.service';
import { AuthGuard, CurrentUser } from '../../lib/guards/auth.guard';
import {
  CreateTaskDto,
  ReadCalendarDateDto,
  UpdateCalendarDateDto,
} from './dto';

@UseGuards(AuthGuard)
@Controller('/calendars')
export class TaskController {
  constructor(
    private readonly service: TaskService,
    private readonly calendarService: CalendarService,
    private readonly todoService: TodoService,
  ) {}

  @Post('/:cid/date/:date')
  async readCalendarDate(
    // @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
    @CurrentUser() user: ReqUser,
  ): Promise<string> {
    const dto = ReadCalendarDateDto.fromBody(urlCid, date, user);

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

    // Response
    const todos = undoneTodos.map((todo) => ({
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
        id: calendar.id,
        name: calendar.name,
        color: calendar.color,
        plannedColor: calendar.planned_color,
        usesNotes: calendar.uses_notes || undefined,
      },
      date: dto.date,
      doneTasks: doneTasks.map((doneTask) => ({
        id: doneTask.id,
        notes: doneTask.notes || undefined,
      })),
      todos,
    };
    return JSON.stringify(response);
  }

  @Post('/:cid/date-create')
  async createCalendarDate(
    @Body() body: any,
    @Param('cid') urlCid: string,
  ): Promise<string> {
    const dto = CreateTaskDto.fromBody(urlCid, body);

    await this.service.createDoneTask(dto);

    return 'ok';
  }

  @Post('/:cid/date-upd-notes/:date')
  async updateCalendarDate(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
  ): Promise<string> {
    const dto = UpdateCalendarDateDto.fromBody(urlCid, date, body);

    await this.service.updateTaskNotesByDate(dto);

    return 'ok';
  }
}
