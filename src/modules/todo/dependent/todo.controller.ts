import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TCalendarSDK, TNewDoneTask, TNewTodo } from '../../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../../lib/guards/access-token.guard';
import { todoRoutes } from '../core/todo.routes';

@UseGuards(AccessTokenGuard)
@Controller('/calendars')
export class TodoController {
  @Get('streamline')
  readStreamline(
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarSDK.ReadPlannedEventsResponse> {
    return todoRoutes.readStreamline(user);
  }

  @Post(':cid/todo')
  create(
    @Param('cid') paramCalendarId: string,
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    return todoRoutes.create(paramCalendarId, body, user);
  }

  @Post('/:cid/todo/:tid/update-notes')
  updateTodoNotes(
    @Param('cid') paramCalendarId: string,
    @Param('tid') paramTodoId: string,
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    return todoRoutes.updateTodoNotes(paramCalendarId, paramTodoId, body, user);
  }

  @Post('/:cid/todo/:tid/move')
  moveTodo(
    @Param('cid') paramCalendarId: string,
    @Param('tid') paramTodoId: string,
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    return todoRoutes.moveTodo(paramCalendarId, paramTodoId, body, user);
  }

  @Post('/:cid/todo/:tid/set-as-done')
  updateTodoSetAsDone(
    @Param('cid') paramCalendarId: string,
    @Param('tid') paramTodoId: string,
    @Body() body: any,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewDoneTask> {
    return todoRoutes.updateTodoSetAsDone(
      paramCalendarId,
      paramTodoId,
      body,
      user,
    );
  }
}
