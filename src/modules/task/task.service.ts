import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { CreateTaskDto, UpdateCalendarDateDto } from './dto';
import { isFirstOne } from '../../lib/list';

@Injectable()
export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async findTasksDatesFromCalendars(dateFrom: string, calendarIds: number[]) {
    const allTasks = await this.repository.findTasksFromCalendarsAndDate(
      calendarIds,
      dateFrom,
    );

    // TODO: Index tasks
    return calendarIds.map((calendarId) => ({
      calendarId,
      dates: allTasks
        .filter((task) => task.calendar_id === calendarId)
        .map((task) => task.date)
        .filter(isFirstOne),
    }));
  }

  async findTasksFromCalendar(calendarId: number) {
    const tasks = await this.repository.findTasksFromCalendar(calendarId);

    return tasks.map((task) => ({
      id: task.id,
      calendar: task.calendar_id,
      date: task.date,
      notes: task.notes || undefined,
    }));
  }

  async areThereTasksWithNotes(calendarId: number) {
    const count =
      await this.repository.countTasksWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async findTasksFromCalendarAndDate(calendarId: number, date: string) {
    const tasks = await this.repository.findTaskFromCalendarAndDate(
      calendarId,
      date,
    );

    // TODO: This may return multiple Tasks for the same Date

    return tasks.map((task) => ({
      id: task.id,
      notes: task.notes || undefined,
    }));
  }

  createDoneTask(dto: CreateTaskDto) {
    return this.repository.create(dto);
  }

  async updateTaskNotesByDate(dto: UpdateCalendarDateDto) {
    // FIXME: Bug if there are multiple Tasks for the same Date
    const tasks = await this.findTasksFromCalendarAndDate(
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
