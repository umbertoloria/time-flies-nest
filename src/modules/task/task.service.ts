import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { isFirstOne } from '../../lib/list';
import { TaskRto } from './rto';

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

    return tasks.map(TaskRto.fromEntity);
  }

  async areThereTasksWithNotes(calendarId: number) {
    const count =
      await this.repository.countTasksWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async findTasksFromCalendarAndDate(
    calendarId: number,
    date: string,
  ): Promise<TaskRto[]> {
    const tasks = await this.repository.findTaskFromCalendarAndDate(
      calendarId,
      date,
    );

    // TODO: This may return multiple Tasks for the same Date

    return tasks.map(TaskRto.fromEntity);
  }

  async createDoneTask(dto: CreateTaskDto) {
    const task = await this.repository.create(dto);

    return TaskRto.fromEntity(task);
  }

  async updateTaskNotesByDate(dto: UpdateTaskDto) {
    const task = await this.repository.findTask(dto.calendarId, dto.taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const upd = await this.repository.update(dto);

    return TaskRto.fromEntity(upd);
  }
}
