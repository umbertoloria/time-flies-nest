import { ITodoRepository } from './itodo.repository';
import {
  CreateTodoDto,
  ReadTodosFromDateDto,
  SetTodoAsDoneDto,
  UpdateTodoDto,
} from './dto';
import { TodoEntity } from './entity';
import { TodoNotFoundError } from './errors';
import {
  createGroupedItemsAndIds,
  excludeDuplicates,
  fromEntries,
} from '@core/utils';

export class TodoService {
  constructor(private repository: ITodoRepository) {}

  async findTodoValidate(calendarId: number, todoId: number) {
    const todo = await this.repository.findTodo(calendarId, todoId);

    if (!todo || todo.calendarId !== calendarId) {
      throw new TodoNotFoundError();
    }

    return todo;
  }

  findUndoneTodosByCalendars(calendarIds: number[]): Promise<TodoEntity[]> {
    return this.repository.findUndoneTodosByCalendarIds(calendarIds);
  }

  async mapCalendarIds2UndoneTodoDates(
    calendarIds: number[],
  ): Promise<Record<number, string[] | undefined>> {
    const todos =
      await this.repository.findUndoneTodosDatesByCalendarIds(calendarIds);

    const { idx, ids } = createGroupedItemsAndIds(todos, 'calendarId');

    return fromEntries(
      ids.map((calendarId) => [
        calendarId,
        excludeDuplicates(idx[calendarId]!.map((todo) => todo.date)),
      ]),
    );
  }

  findUndoneTodosByCalendar(dto: ReadTodosFromDateDto): Promise<TodoEntity[]> {
    return this.repository.findUndoneTodosByCalendar(dto);
  }

  async areThereTodosWithNotes(calendarId: number) {
    const count =
      await this.repository.countTodosWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async createTodo(dto: CreateTodoDto) {
    return await this.repository.create(dto);
  }

  async updateTodo(dto: UpdateTodoDto): Promise<TodoEntity> {
    const upd = await this.repository.update(dto);

    console.log('updated', upd);

    return upd;
  }

  async setTodoAsDone(dto: SetTodoAsDoneDto): Promise<TodoEntity> {
    const upd = await this.repository.setAsDone(dto);

    console.log('todo set as done', upd);

    return upd;
  }
}
