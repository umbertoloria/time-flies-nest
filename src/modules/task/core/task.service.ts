import { isFirstOne } from '@shared/core/lib/list';
import { taskRepository } from '../dependent/task.repository';
import { TaskRto } from '../dependent/rto';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TaskNotFoundError } from './errors';

class TaskService {
  async findTasksDatesFromCalendars(dateFrom: string, calendarIds: number[]) {
    const allTasks = await taskRepository.findTasksFromCalendarsAndDate(
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

  async findTasksFromCalendarsAndDate(
    calendarIds: number[],
    dateFrom: string,
  ): Promise<TaskRto[]> {
    const tasks = await taskRepository.findTasksFromCalendarsAndDate(
      calendarIds,
      dateFrom,
    );

    return tasks.map(TaskRto.fromEntity);
  }

  async findTasksFromCalendar(calendarId: number) {
    const tasks = await taskRepository.findTasksFromCalendar(calendarId);

    return tasks.map(TaskRto.fromEntity);
  }

  async areThereTasksWithNotes(calendarId: number) {
    const count =
      await taskRepository.countTasksWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async findTasksFromCalendarAndDate(
    calendarId: number,
    date: string,
  ): Promise<TaskRto[]> {
    const tasks = await taskRepository.findTaskFromCalendarAndDate(
      calendarId,
      date,
    );

    // TODO: This may return multiple Tasks for the same Date

    return tasks.map(TaskRto.fromEntity);
  }

  async createDoneTask(dto: CreateTaskDto) {
    const task = await taskRepository.create(dto);

    return TaskRto.fromEntity(task);
  }

  async updateTaskNotesByDate(dto: UpdateTaskDto) {
    const task = await taskRepository.findTask(dto.calendarId, dto.taskId);

    if (!task) {
      throw new TaskNotFoundError();
    }

    const upd = await taskRepository.update(dto);

    return TaskRto.fromEntity(upd);
  }
}

export const taskService = new TaskService();
