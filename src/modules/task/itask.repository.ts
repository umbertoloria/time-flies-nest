import { TaskEntity } from './entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';

export interface ITaskRepository {
  findTask(calendarId: number, taskId: number): Promise<TaskEntity | null>;

  findTasksFromCalendarsAndDate(
    calendarIds: number[],
    dateFrom: string,
  ): Promise<TaskEntity[]>;

  findTasksFromCalendar(calendarId: number): Promise<TaskEntity[]>;

  countTasksWithNotesFromCalendar(calendarId: number): Promise<number>;

  findTaskFromCalendarAndDate(
    calendarId: number,
    date: string,
  ): Promise<TaskEntity[]>;

  create(dto: CreateTaskDto): Promise<TaskEntity>;

  update(dto: UpdateTaskDto): Promise<TaskEntity>;
}
