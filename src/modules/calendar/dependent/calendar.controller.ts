import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TCalendar, TCalendarPrev, TCalendarRcd } from '../../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../../lib/guards/access-token.guard';
import { ZodValidationPipe } from '../../../lib/pipe/zod-validation.pipe';
import {
  ReadCalendarsGdto,
  ReadCalendarsGdtoSchema,
  UpdateCalendarGdto,
  UpdateCalendarGdtoSchema,
} from './gdto';
import { calendarRoutes } from '../core/calendar.routes';

@UseGuards(AccessTokenGuard)
@Controller('calendars')
export class CalendarController {
  @Get()
  readAll(
    @Query(new ZodValidationPipe(ReadCalendarsGdtoSchema))
    gdto: ReadCalendarsGdto,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarPrev[]> {
    return calendarRoutes.readAll(gdto, user);
  }

  @Post()
  create(
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarRcd> {
    return calendarRoutes.create(body, user);
  }

  @Get('/:id')
  read(
    @Param('id') paramCalendarId: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendar> {
    return calendarRoutes.read(paramCalendarId, user);
  }

  @Post('/:id')
  update(
    @Param('id') paramCalendarId: string,
    @Body(new ZodValidationPipe(UpdateCalendarGdtoSchema))
    gdto: UpdateCalendarGdto,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarRcd> {
    return calendarRoutes.update(paramCalendarId, gdto, user);
  }
}
