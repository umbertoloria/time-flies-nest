import { ITodoRepository } from './itodo.repository';
import { CalendarService } from '@app/calendar/calendar.service';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoEntity } from './entity';
import { TodoAlreadyDoneError, TodoNotFoundError } from './errors';
import {
  createGroupedItemsAndIds,
  excludeDuplicates,
  fromEntries,
} from '@core/utils';

export class TodoService {
  constructor(
    private repository: ITodoRepository,
    private calendarService: CalendarService,
  ) {}

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

  async findTodoFromCalendar(calendarId: number, todoId: number) {
    const todo = await this.repository.findById(todoId);

    if (!todo || todo.calendarId !== calendarId) {
      throw new TodoNotFoundError();
    }

    return todo;
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
    const todo = await this.findTodoFromCalendar(dto.calendarId, dto.todoId);

    // TODO: Verify calendar is user's
    if (todo.doneDate) {
      // To-do Notes can't be updated after it's Done.
      throw new TodoAlreadyDoneError();
    }

    const upd = await this.repository.updateNotes(dto);

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return upd;
  }

  async moveTodo(dto: MoveTodoDto): Promise<TodoEntity> {
    const todo = await this.findTodoFromCalendar(dto.calendarId, dto.todoId);

    // TODO: Verify calendar is user's
    if (todo.doneDate) {
      // To-do can't be MOVED after it's Done.
      throw new TodoAlreadyDoneError();
    }

    if (todo.date === dto.date) {
      // Avoid pointless update.
      return todo;
    }

    // TODO: There could be multiple ToDos on the same day
    const upd = await this.repository.updateDate(dto);

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    console.log('updated', upd);

    return upd;
  }

  async updateTodoSetAsDone(dto: UpdateDoneTodoDto): Promise<TodoEntity> {
    const todo = await this.findTodoFromCalendar(dto.calendarId, dto.todoId);

    const doneDate = todo.date; // Always using the To-do Date as "default".

    const upd = await this.repository.updateTodoDoneDate(
      todo.id,
      doneDate,
      dto,
    );

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return upd;
  }
}
