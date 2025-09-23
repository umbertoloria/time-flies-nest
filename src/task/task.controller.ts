import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { TaskService } from '../task.service';
import { requireAuth } from '../auth';
import {
  get_optional_string,
  validate_date,
  validate_int,
} from '../lib/validate';
import { TCalendarSDK } from '../remote/types';
import { PrismaService } from '../prisma.service';

@Controller('/calendars')
export class TaskController {
  constructor(
    //
    private readonly prismaService: PrismaService,
    private readonly taskService: TaskService,
  ) {}

  @Post('/:cid/date/:date')
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

  @Post('/:cid/date-create/:date')
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
    await this.taskService.createDoneTask(calendarId, {
      date,
      notes: notes || undefined,
    });

    // Response
    return 'ok';
  }

  @Post('/:cid/date-upd-notes/:date')
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
    await this.taskService.updateTaskNotesByDate(calendarId, date, {
      notes: notes || undefined,
    });

    // Response
    return 'ok';
  }
}
