import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TCalendarSDK, TNewDoneTask } from '../../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../../lib/guards/access-token.guard';
import { taskRoutes } from '../core/task.routes';

@UseGuards(AccessTokenGuard)
@Controller('/calendars/:cid/date')
export class TaskController {
  @Post()
  create(
    @Param('cid') paramCalendarId: string,
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewDoneTask> {
    return taskRoutes.create(paramCalendarId, body, user);
  }

  @Get(':date')
  read(
    @Param('cid') paramCalendarId: string,
    @Param('date') date: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarSDK.ReadDateResponse> {
    return taskRoutes.read(paramCalendarId, date, user);
  }

  @Post(':tid')
  async update(
    @Param('cid') paramCalendarId: string,
    @Param('tid') paramTaskId: string,
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewDoneTask> {
    return taskRoutes.update(paramCalendarId, paramTaskId, body, user);
  }
}
