import { ITaskRepository } from './itask.repository';
import { CreateTaskDto, ReadTasksFromDateDto, UpdateTaskDto } from './dto';
import { TaskEntity } from './entity';
import { TaskNotFoundError } from './errors';
import {
  createGroupedItemsAndIds,
  excludeDuplicates,
  fromEntries,
} from '@core/utils';

export class TaskService {
  constructor(private repository: ITaskRepository) {}

  async findTaskValidate(
    calendarId: number,
    taskId: number,
  ): Promise<TaskEntity> {
    const task = await this.repository.findTask(calendarId, taskId);

    if (!task) {
      throw new TaskNotFoundError();
    }

    return task;
  }

  findTasksFromCalendarsAndDate(
    calendarIds: number[],
    dateFrom: string,
  ): Promise<TaskEntity[]> {
    return this.repository.findTasksByCalendarIdsAndDate(calendarIds, dateFrom);
  }

  async mapCalendarIds2DoneTaskDates(
    dateFrom: string,
    calendarIds: number[],
  ): Promise<Record<number, string[] | undefined>> {
    const tasks = await this.repository.findTasksDatesByCalendarIdsAndDate(
      calendarIds,
      dateFrom,
    );

    const { idx, ids } = createGroupedItemsAndIds(tasks, 'calendarId');

    return fromEntries(
      ids.map((calendarId) => [
        calendarId,
        excludeDuplicates(idx[calendarId]!.map((task) => task.date)),
      ]),
    );
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
    dto: ReadTasksFromDateDto,
  ): Promise<TaskEntity[]> {
    return this.repository.findTaskFromCalendarAndDate(dto);
  }

  async createDoneTask(dto: CreateTaskDto) {
    return this.repository.create(dto);
  }

  async updateTaskNotesByDate(dto: UpdateTaskDto) {
    return await this.repository.update(dto);
  }
}
