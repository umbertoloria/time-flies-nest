import { ITaskRepository } from './itask.repository';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TaskEntity } from './entity';
import { isFirstOne } from '@core/lib/list';
import { TaskNotFoundError } from './errors';

export class TaskService {
  constructor(private taskRepository: ITaskRepository) {}

  async findTasksDatesFromCalendars(dateFrom: string, calendarIds: number[]) {
    const allTasks = await this.taskRepository.findTasksFromCalendarsAndDate(
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
    return this.taskRepository.findTasksFromCalendarsAndDate(
      calendarIds,
      dateFrom,
    );
  }

  findTasksFromCalendar(calendarId: number) {
    return this.taskRepository.findTasksFromCalendar(calendarId);
  }

  async areThereTasksWithNotes(calendarId: number) {
    const count =
      await this.taskRepository.countTasksWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  findTasksFromCalendarAndDate(
    calendarId: number,
    date: string,
  ): Promise<TaskEntity[]> {
    // TODO: This may return multiple Tasks for the same Date

    return this.taskRepository.findTaskFromCalendarAndDate(calendarId, date);
  }

  async createDoneTask(dto: CreateTaskDto) {
    return this.taskRepository.create(dto);
  }

  async updateTaskNotesByDate(dto: UpdateTaskDto) {
    const task = await this.taskRepository.findTask(dto.calendarId, dto.taskId);

    if (!task) {
      throw new TaskNotFoundError();
    }

    return await this.taskRepository.update(dto);
  }
}
