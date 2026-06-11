import { ITaskRepository } from './itask.repository';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TaskEntity } from './entity';
import { TaskNotFoundError } from './errors';

export class TaskService {
  constructor(private repository: ITaskRepository) {}

  findTasksDatesFromCalendars(
    dateFrom: string,
    calendarIds: number[],
  ): Promise<TaskEntity[]> {
    return this.repository.findTasksFromCalendarsAndDate(calendarIds, dateFrom);
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
