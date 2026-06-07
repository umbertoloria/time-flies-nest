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
import { TCalendar, TCalendarPrev, TCalendarRcd } from '../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import { ZodValidationPipe } from '../../lib/pipe/zod-validation.pipe';
import {
  ReadCalendarsGdto,
  ReadCalendarsGdtoSchema,
  UpdateCalendarGdto,
  UpdateCalendarGdtoSchema,
} from './gdto';
import { ReadCalendarDto, UpdateCalendarDto } from './dto';
import { CalendarRoutes } from './calendar.routes';

@UseGuards(AccessTokenGuard)
@Controller('calendars')
export class CalendarController {
  private routes: CalendarRoutes;

  constructor(
    private service: CalendarService,
    private todoService: TodoService,
    private taskService: TaskService,
  ) {
    this.routes = new CalendarRoutes(
      this.service,
      this.todoService,
      this.taskService,
    );
  }

  @Get()
  readAll(
    @Query(new ZodValidationPipe(ReadCalendarsGdtoSchema))
    gdto: ReadCalendarsGdto,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarPrev[]> {
    return this.routes.readAll(gdto, user);
  }

  @Post()
  create(
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarRcd> {
    return this.routes.create(body, user);
  }

  @Get('/:id')
  read(
    @Param('id') paramCalendarId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendar> {
    return this.routes.read(paramCalendarId, user);
  }

  @Post('/:id')
  async update(
    @Param('id') paramCalendarId: string,
    @Body(new ZodValidationPipe(UpdateCalendarGdtoSchema))
    gdto: UpdateCalendarGdto,
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
}
