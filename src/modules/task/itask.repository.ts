import { TaskEntity } from './entity';
import { CreateTaskDto, ReadTaskDto, UpdateTaskDto } from './dto';

export interface ITaskRepository {
  findTask(calendarId: number, taskId: number): Promise<TaskEntity | null>;

  findTasksByCalendarIdsAndDate(
    calendarIds: number[],
    dateFrom: string,
  ): Promise<TaskEntity[]>;

  findTasksFromCalendar(calendarId: number): Promise<TaskEntity[]>;

  countTasksWithNotesFromCalendar(calendarId: number): Promise<number>;

  findTaskFromCalendarAndDate(dto: ReadTaskDto): Promise<TaskEntity[]>;

  create(dto: CreateTaskDto): Promise<TaskEntity>;

  update(dto: UpdateTaskDto): Promise<TaskEntity>;
}
