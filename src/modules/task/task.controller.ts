import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { TCalendarSDK, TNewDoneTask } from '../../sdk/types';
import { CalendarService } from '../calendar/calendar.service';
import { TodoService } from '../todo/todo.service';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import {
  CreateTaskDto,
  ReadCalendarDateDto,
  UpdateCalendarDateDto,
} from './dto';

@UseGuards(AccessTokenGuard)
@Controller('/calendars/:cid/date')
export class TaskController {
  constructor(
    private readonly service: TaskService,
    private readonly calendarService: CalendarService,
    private readonly todoService: TodoService,
  ) {}

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

    return {
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
  }

  @Post()
  async create(
    @Body() body: any,
    @Param('cid') paramCalendarId: string,
  ): Promise<string> {
    const dto = CreateTaskDto.fromBody(paramCalendarId, body);

    await this.service.createDoneTask(dto);

    return 'ok';
  }

  @Post(':date')
  async update(
    @Body() body: any,
    @Param('cid') paramCalendarId: string,
    @Param('date') date: string,
  ): Promise<TNewDoneTask> {
    const dto = UpdateCalendarDateDto.fromBody(paramCalendarId, date, body);

    const updatedTask = await this.service.updateTaskNotesByDate(dto);

    return updatedTask.toTNewDoneTask();
  }
}
