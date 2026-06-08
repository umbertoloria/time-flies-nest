import { CreateTaskDto, ReadCalendarDateDto, UpdateTaskDto } from './dto';
import { todoService } from '../../todo/core/todo.service';
import { taskService } from './task.service';
import { TCalendarSDK, TNewDoneTask } from '../../../core/sdk/types';
import { calendarService } from '../../calendar/core/calendar.service';

class TaskRoutes {
  async create(
    paramCalendarId: string,
    body: any,
    user: ReqUser,
  ): Promise<TNewDoneTask> {
    // FIXME: Ops... forgot to check if user owns the calendar...
    const dto = CreateTaskDto.fromBody(paramCalendarId, body);

    const createdTask = await taskService.createDoneTask(dto);

    return createdTask.toTNewDoneTask();
  }

  async read(
    paramCalendarId: string,
    date: string,
    user: ReqUser,
  ): Promise<TCalendarSDK.ReadDateResponse> {
    // TODO: Responds with both Tasks and Todos...
    const dto = ReadCalendarDateDto.fromBody(paramCalendarId, date, user);

    // BL
    const calendar = await calendarService.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const undoneTodos = await todoService.findUndoneTodosByCalendar(
      calendar.id,
      dto.date,
    );

    const doneTasks = await taskService.findTasksFromCalendarAndDate(
      dto.calendarId,
      dto.date,
    );

    return {
      calendar: calendar.toTCalendarRcd(),
      date: dto.date,
      doneTasks: doneTasks.map((doneTask) => doneTask.toTNewDoneTask()),
      todos: undoneTodos.map((todo) => todo.toTNewTodo()),
    };
  }

  async update(
    paramCalendarId: string,
    paramTaskId: string,
    body: any,
    user: ReqUser,
  ) {
    // FIXME: Ops... forgot to check if user owns the calendar...
    const dto = UpdateTaskDto.fromBody(paramCalendarId, paramTaskId, body);

    const updatedTask = await taskService.updateTaskNotesByDate(dto);

    return updatedTask.toTNewDoneTask();
  }
}

export const taskRoutes = new TaskRoutes();
