import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { TodoService } from '../todo/todo.service';
import { TaskService } from '../task/task.service';
import { TCalendar, TCalendarPrev, TCalendarRcd, TDay } from '../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import { ReadCalendarsGdto, UpdateCalendarGdto } from './gdto';
import {
  CreateCalendarDto,
  ReadCalendarDto,
  ReadCalendarsDto,
  UpdateCalendarDto,
} from './dto';

@UseGuards(AccessTokenGuard)
@Controller('calendars')
export class CalendarController {
  constructor(
    private service: CalendarService,
    private todoService: TodoService,
    private taskService: TaskService,
  ) {}

  @Get()
  async readAll(
    @Query() gdto: ReadCalendarsGdto,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarPrev[]> {
    const dto = ReadCalendarsDto.fromGateway(gdto, user);

    // BL
    const calendars = await this.service.readCalendarIDsFromUserIdViaSortedPin(
      dto.user.id,
      dto.showAll,
    );
    const calendarIds = calendars.map((calendar) => calendar.id);

    const undoneTodos =
      await this.todoService.findUndoneTodosByCalendars(calendarIds);
    const mapCalendar2Todos = calendarIds.map((calendarId) => ({
      calendarId,
      todoDates: undoneTodos
        .filter((todo) => todo.calendar_id === calendarId)
        .map((todo) => todo.date),
    }));

    const mapCalendar2DoneTasks =
      await this.taskService.findTasksDatesFromCalendars(
        dto.dateFrom,
        calendarIds,
      );

    // Response
    return calendars.map<TCalendarPrev>((dbCalendar) => {
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
    });
  }

  @Post()
  async create(
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarRcd> {
    const dto = CreateCalendarDto.fromBody(body, user);

    const createdCalendar = await this.service.createCalendar(dto);

    return createdCalendar.toTCalendarRcd();
  }

  @Post('/:id')
  async update(
    @Param('id') paramCalendarId: string,
    @Body() gdto: UpdateCalendarGdto,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarRcd> {
    const dto = UpdateCalendarDto.fromParam(paramCalendarId, gdto, user);

    // BL
    if (!dto.usesNotes) {
      // Calendar "Uses Notes" cannot be disabled if it contains Notes...

      // ... from Todos.
      const areThereTodosWithNotesInCalendar =
        await this.todoService.areThereTodosWithNotes(dto.calendarId);
      if (areThereTodosWithNotesInCalendar) {
        // TODO: This is a leak if user is not the Calendar owner
        throw new BadRequestException('Calendar UsesNotes cannot be disabled');
      }

      // ... from (Done) Tasks.
      const areThereTasksWithNotesInCalendar =
        await this.taskService.areThereTasksWithNotes(dto.calendarId);
      if (areThereTasksWithNotesInCalendar) {
        throw new BadRequestException('Calendar UsesNotes cannot be disabled');
      }
    }

    const updatedCalendar = await this.service.updateCalendar(dto);

    return updatedCalendar.toTCalendarRcd();
  }

  @Get('/:id')
  async read(
    @Param('id') paramCalendarId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendar> {
    const dto = ReadCalendarDto.fromParam(paramCalendarId, user);

    // BL
    const calendar = await this.service.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const undoneTodos = await this.todoService.findUndoneTodosByCalendars([
      calendar.id,
    ]);

    const tasks = await this.taskService.findTasksFromCalendar(dto.calendarId);

    // Response
    const plannedDays = undoneTodos.map((todo) => ({
      date: todo.date,
      notes: todo.notes || undefined,
    }));

    return {
      id: calendar.id,
      name: calendar.name,
      color: calendar.color,
      plannedColor: calendar.planned_color,
      usesNotes: calendar.uses_notes || undefined,
      days: tasks.map<TDay>((task) => ({
        date: task.date,
        notes: task.notes || undefined,
      })),
      plannedDays,
    };
  }
}
