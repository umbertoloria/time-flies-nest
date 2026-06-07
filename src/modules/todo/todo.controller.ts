import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from '../calendar/core/calendar.service';
import { TodoService } from './todo.service';
import { TaskService } from '../task/task.service';
import { TCalendarSDK, TNewDoneTask, TNewTodo } from '../../sdk/types';
import {
  AccessTokenGuard,
  CurrentUser,
} from '../../lib/guards/access-token.guard';
import {
  excludeDuplicates,
  getIds,
  getValuesFromList,
} from '../../lib/extract';
import {
  CreateTodoDto,
  MoveTodoDto,
  ReadStreamlineDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { CreateTaskDto } from '../task/dto';
import { CalendarRepository } from '../calendar/calendar.repository';

@UseGuards(AccessTokenGuard)
@Controller('/calendars')
export class TodoController {
  private calendarService: CalendarService;

  constructor(
    private service: TodoService,
    private calendarRepository: CalendarRepository,
    private taskService: TaskService,
  ) {
    this.calendarService = new CalendarService(this.calendarRepository);
  }

  @Get('streamline')
  async readStreamline(
    @CurrentUser() user: ReqUser,
  ): Promise<TCalendarSDK.ReadPlannedEventsResponse> {
    const dto = ReadStreamlineDto.fromBody(user);

    // BL
    const calendars =
      await this.calendarService.readCalendarIDsFromUserIdViaSortedPin(
        dto.user.id,
        true,
      );
    const calendarIds = getIds(calendars);

    const undoneTodos =
      await this.service.findUndoneTodosByCalendars(calendarIds);

    const doneTasks = undoneTodos.length
      ? await this.taskService.findTasksFromCalendarsAndDate(
          calendarIds,
          undoneTodos[0].date,
        )
      : [];

    const sortedDates = excludeDuplicates([
      ...getValuesFromList(undoneTodos, 'date'),
      ...getValuesFromList(doneTasks, 'date'),
    ]);

    // Response
    return {
      dates: sortedDates.map<TCalendarSDK.ReadPlannedEventsResponseDateBox>(
        (date) => {
          const dateUndoneTodos = undoneTodos.filter(
            (todo) => todo.date === date,
          );
          const dateDoneTasks = doneTasks.filter((task) => task.date === date);
          const dateCalendarIds = excludeDuplicates([
            ...getValuesFromList(dateUndoneTodos, 'calendarId'),
            ...getValuesFromList(dateDoneTasks, 'calendarId'),
          ]);
          return {
            date,
            calendars: calendars
              .filter((calendar) => dateCalendarIds.includes(calendar.id))
              .map<TCalendarSDK.ReadPlannedEventsResponseCalendar>(
                (calendar) => {
                  const dateCalendarUndoneTodos = dateUndoneTodos.filter(
                    (todo) => todo.calendarId === calendar.id,
                  );
                  const dateCalendarDoneTasks = dateDoneTasks.filter(
                    (task) => task.calendarId === calendar.id,
                  );
                  return {
                    ...calendar.toTCalendarRcd(),
                    sortedPin: calendar.sortedPin,
                    todos: dateCalendarUndoneTodos.length
                      ? dateCalendarUndoneTodos.map((todo) => todo.toTNewTodo())
                      : undefined,
                    doneTasks: dateCalendarDoneTasks.length
                      ? dateCalendarDoneTasks.map((task) =>
                          task.toTNewDoneTask(),
                        )
                      : undefined,
                  };
                },
              ),
          };
        },
      ),
    };
  }

  @Post(':cid/todo')
  async create(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = CreateTodoDto.fromBody(urlCid, body, user);

    const insTodo = await this.service.createTodo(dto);
    console.log('created', insTodo);

    return insTodo.toTNewTodo();
  }

  @Post('/:cid/todo/:tid/update-notes')
  async updateTodoNotes(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = UpdateTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const todo = await this.service.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

    // TODO: Verify calendar is user's
    if (todo.doneDate) {
      // To-do Notes can't be updated after it's Done.
      throw new BadRequestException('Todo already done');
    }

    const updTodo = await this.service.updateTodoNotes(dto);
    console.log('updated', updTodo);

    // Response
    return updTodo.toTNewTodo();
  }

  @Post('/:cid/todo/:tid/move')
  async moveTodo(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewTodo> {
    const dto = MoveTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const todo = await this.service.findTodoFromCalendar(
      dto.calendarId,
      dto.todoId,
    );

    // TODO: Verify calendar is user's
    if (todo.doneDate) {
      // To-do can't be MOVED after it's Done.
      throw new BadRequestException('Todo already done');
    }

    if (todo.date !== dto.date) {
      const updTodo = await this.service.moveTodo(dto);
      console.log('updated', updTodo);
      // TODO: There could be multiple ToDos on the same day

      return updTodo.toTNewTodo();
    }
    // Otherwise, pointless update...

    // Response
    return todo.toTNewTodo();
  }

  @Post('/:cid/todo/:tid/set-as-done')
  async updateTodoSetAsDone(
    @Body() body: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
    @CurrentUser() user: ReqUser,
  ): Promise<TNewDoneTask> {
    const dto = UpdateDoneTodoDto.fromBody(urlCid, urlTid, body, user);

    // BL
    const updTodo = await this.service.updateTodoSetAsDone(dto);

    const createTaskDto = CreateTaskDto.fromTodoSetAsDone(updTodo);
    const createdDoneTask =
      await this.taskService.createDoneTask(createTaskDto);

    return createdDoneTask.toTNewDoneTask();
  }
}
