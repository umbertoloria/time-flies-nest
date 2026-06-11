import { ITaskRepository } from './itask.repository';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TaskEntity } from './entity';
import { isFirstOne } from '@core/lib/list';
import { TaskNotFoundError } from './errors';

export class TaskService {
  constructor(private repository: ITaskRepository) {}

  async findTasksDatesFromCalendars(dateFrom: string, calendarIds: number[]) {
    const allTasks = await this.repository.findTasksFromCalendarsAndDate(
      calendarIds,
      dateFrom,
    );

    // TODO: Index tasks
    return calendarIds.map((calendarId) => ({
      calendarId,
      dates: allTasks
        .filter((task) => task.calendarId === calendarId)
        .map((task) => task.date)
        .filter(isFirstOne),
    }));
  }

  findTasksFromCalendarsAndDate(
    calendarIds: number[],
    dateFrom: string,
  ): Promise<TaskEntity[]> {
    return this.repository.findTasksFromCalendarsAndDate(calendarIds, dateFrom);
  }

  findTasksFromCalendar(calendarId: number) {
    return this.repository.findTasksFromCalendar(calendarId);
  }

  async areThereTasksWithNotes(calendarId: number) {
    const count =
      await this.repository.countTasksWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  findTasksFromCalendarAndDate(
    calendarId: number,
    date: string,
  ): Promise<TaskEntity[]> {
    // TODO: This may return multiple Tasks for the same Date

    return this.repository.findTaskFromCalendarAndDate(calendarId, date);
  }

  async createDoneTask(dto: CreateTaskDto) {
    return this.repository.create(dto);
  }

  async updateTaskNotesByDate(dto: UpdateTaskDto) {
    const task = await this.repository.findTask(dto.calendarId, dto.taskId);

    if (!task) {
      throw new TaskNotFoundError();
    }

    return await this.repository.update(dto);
  }
}
