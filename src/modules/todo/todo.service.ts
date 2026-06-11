import { ITodoRepository } from './itodo.repository';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
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
    const todos = await this.findUndoneTodosByCalendars(calendarIds);

    const { idx, ids } = createGroupedItemsAndIds(todos, 'calendarId');

    return fromEntries(
      ids.map((calendarId) => [
        calendarId,
        excludeDuplicates(idx[calendarId]!.map((todo) => todo.date)),
      ]),
    );
  }

  findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<TodoEntity[]> {
    return this.repository.findUndoneTodosByCalendar(calendarId, filterDate);
  }

  async areThereTodosWithNotes(calendarId: number) {
    const count =
      await this.repository.countTodosWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async createTodo(dto: CreateTodoDto) {
    return await this.repository.create(dto);
  }

  async updateTodoNotes(dto: UpdateTodoDto): Promise<TodoEntity> {
    const upd = await this.repository.updateNotes(dto);

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return upd;
  }

  async moveTodo(dto: MoveTodoDto): Promise<TodoEntity> {
    // TODO: There could be multiple ToDos on the same day
    const upd = await this.repository.updateDate(dto);

    console.log('updated', upd);

    return upd;
  }

  async updateTodoSetAsDone(
    dto: UpdateDoneTodoDto,
    doneDate: string,
  ): Promise<TodoEntity> {
    const upd = await this.repository.updateTodoDoneDate(dto, doneDate);

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return upd;
  }
}
