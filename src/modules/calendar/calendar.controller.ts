import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
} from './core/gdto';
import { CalendarRoutes } from './core/calendar.routes';

@UseGuards(AccessTokenGuard)
@Controller('calendars')
export class CalendarController {
  private routes: CalendarRoutes;

  constructor(
    private todoService: TodoService,
    private taskService: TaskService,
  ) {
    this.routes = new CalendarRoutes(this.todoService, this.taskService);
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
  update(
    @Param('id') paramCalendarId: string,
    @Body(new ZodValidationPipe(UpdateCalendarGdtoSchema))
    gdto: UpdateCalendarGdto,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarRcd> {
    return this.routes.update(paramCalendarId, gdto, user);
  }
}
