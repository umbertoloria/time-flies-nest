import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { CreateTaskDto, UpdateCalendarDateDto } from './dto';
import { isFirstOne } from '../../lib/list';

@Injectable()
export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async readTasksDatesFromCalendars(dateFrom: string, dbCalendarIds: number[]) {
    const result = await this.repository.findTasksFromCalendarsAndDate(
      dbCalendarIds,
      dateFrom,
    );
    return dbCalendarIds.map((calendarId) => ({
      calendarId,
      dates: result
        .filter((task) => task.calendar_id === calendarId)
        .map((task) => task.date)
        .filter(isFirstOne),
    }));
  }

  async readTasksFromCalendar(calendarId: number) {
    const result = await this.repository.findTasksFromCalendar(calendarId);
    return result.map((task) => ({
      id: task.id,
      calendar: task.calendar_id,
      date: task.date,
      notes: task.notes || undefined,
    }));
  }

  async areThereTasksWithNotes(calendarId: number) {
    const result = await this.repository.countTasksFromCalendar(calendarId);
    return result > 0 ? 'calendar-uses-notes-cannot-be-disabled' : 'ok';
  }

  async readTasksFromCalendarAndDate(calendarId: number, date: string) {
    const result = await this.repository.findTaskFromCalendarAndDate(
      calendarId,
      date,
    );
    // TODO: Returning multiple Tasks for the same Day
    return result.map((task) => ({
      id: task.id,
      notes: task.notes || undefined,
    }));
  }

  createDoneTask(dto: CreateTaskDto) {
    return this.repository.create(dto);
  }

  async updateTaskNotesByDate(dto: UpdateCalendarDateDto) {
    // FIXME: Bug if there are multiple Tasks for the same Date
    const tasks = await this.readTasksFromCalendarAndDate(
      dto.calendarId,
      dto.date,
    );

    if (!tasks.length) {
      throw new NotFoundException('Task not found');
    }
    if (tasks.length > 1) {
      throw new NotFoundException('Task not found');
    }

    const taskId = tasks[0].id;

    return await this.repository.update(taskId, dto);
  }
}
