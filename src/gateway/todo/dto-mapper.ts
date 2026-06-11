import { TodoEntity } from '@app/todo/entity';
import { CreateTaskDto } from '@app/task/dto';

export function createCreateTaskDtoFromTodoSetAsDone(
  updTodo: TodoEntity,
): CreateTaskDto {
  return {
    calendarId: updTodo.calendarId,
    date: updTodo.date,
    notes: updTodo.notes ?? undefined,
  };
}
