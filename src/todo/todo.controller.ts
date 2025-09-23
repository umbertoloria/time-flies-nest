import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  get_optional_string,
  get_required_local_date,
  get_required_string,
  validate_int,
} from '../lib/validate';
import { PrismaService } from '../prisma.service';
import { TaskService } from '../task.service';

@Controller('/calendars')
export class TodoController {
  constructor(
    //
    private prismaService: PrismaService,
    private taskService: TaskService,
  ) {}

  @Post('/:cid/todo-create/:date')
  async createTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = get_optional_string(bodyParams, 'notes');

    // BL
    const insTodo = await this.prismaService.todo.create({
      data: {
        calendar_id: calendarId,
        date: date,
        done_date: null,
        notes: notes || undefined,
        // missed: undefined,
      },
    });
    // TODO: Verify calendar is user's
    console.log('created', insTodo);

    // Response
    return 'ok';
  }

  @Post('/:cid/todo-upd/:tid')
  async updateTodoNotes(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const notes = get_optional_string(bodyParams, 'notes');

    // BL
    const dbTodo = await this.prismaService.readTodo(calendarId, todoId);
    if (!dbTodo) {
      throw new NotFoundException('Todo not found');
    }
    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do Notes can't be updated after it's Done.
      throw new BadRequestException('Todo already done');
    }

    const updTodo = await this.prismaService.todo.update({
      where: {
        id: todoId,
        calendar_id: calendarId,
      },
      data: {
        notes: notes || null,
      },
    });
    console.log('updated', updTodo);

    // Response
    return 'ok';
  }

  @Post('/:cid/todo-move/:tid')
  async moveTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const date = get_required_local_date(bodyParams, 'date');

    // BL
    const dbTodo = await this.prismaService.readTodo(calendarId, todoId);
    if (!dbTodo) {
      throw new NotFoundException('Todo not found');
    }
    // TODO: Verify calendar is user's
    if (dbTodo.done_date) {
      // To-do can't be MOVED after it's Done.
      throw new BadRequestException('Todo already done');
    }

    if (dbTodo.date !== date) {
      const updTodo = await this.prismaService.todo.update({
        where: {
          id: todoId,
          calendar_id: calendarId,
        },
        data: {
          date,
        },
      });
      console.log('updated', updTodo);
      // TODO: There could be multiple ToDos on the same day
    }
    // Otherwise, pointless update...

    /*
    // TODO: Deprecated
    // Forward
    return (await getSDK(this.prismaService, this.configService, bodyParams))
      .movePlannedEvent(calendarId, todoId, date)
      .then(JSON.stringify);
    */

    // Response
    return 'ok';
  }

  @Post('/:cid/todo-done/:tid')
  async doneOrMissedTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const mode = get_required_string(bodyParams, 'mode');
    if (mode === 'done') {
      // Validation
      const notes = get_optional_string(bodyParams, 'notes');

      // BL
      const dbTodo = await this.prismaService.readTodo(calendarId, todoId);
      if (!dbTodo) {
        throw new NotFoundException('Todo not found');
      }
      // TODO: Verify calendar is user's

      const todayDate = dbTodo.date; // Always using the To-do Date as "default".
      const updTodo = await this.prismaService.todo.update({
        where: {
          id: dbTodo.id,
        },
        data: {
          done_date: todayDate,
          // TODO: To-do set as Done ambiguity: "notes" become NULL or kept?
          notes: notes || undefined,
        },
      });
      console.log('updated', updTodo);

      await this.taskService.createDoneTask(calendarId, {
        date: dbTodo.date,
        notes: updTodo.notes || undefined,
      });

      return 'ok';
    } else if (mode === 'missed') {
      // FIXME: Disable this function on frontend as well
      throw new BadRequestException('Deprecated');

      /*
      // TODO: Deprecated
      // Forward
      return (await getSDK(this.prismaService, this.configService, bodyParams))
        .setPlannedEventAsDone(calendarId, todoId, {
          type: 'missed',
        })
        .then(JSON.stringify);
      */
    } else {
      // Should never happen.
      throw new BadRequestException("Param 'mode' invalid");
    }
  }
}
