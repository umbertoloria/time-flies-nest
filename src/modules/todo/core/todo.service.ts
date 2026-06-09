import { TodoRepository } from '../dependent/todo.repository';
import { CalendarService } from '@app/calendar/core/calendar.service';
import { TodoRto } from '../dependent/rto';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoNotFoundError } from './errors';

export class TodoService {
  constructor(
    private todoRepository: TodoRepository,
    private calendarService: CalendarService,
  ) {}

  async findUndoneTodosByCalendars(calendarIds: number[]): Promise<TodoRto[]> {
    const todos = await this.todoRepository.findTodosFromCalendars(calendarIds);

    return todos.map(TodoRto.fromEntity);
  }

  async findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<TodoRto[]> {
    const undoneTodos = await this.todoRepository.findUndoneTodosByCalendar(
      calendarId,
      filterDate,
    );

    return undoneTodos.map(TodoRto.fromEntity);
  }

  async findTodoFromCalendar(calendarId: number, todoId: number) {
    const todo = await this.todoRepository.findById(todoId);

    if (!todo || todo.calendar_id !== calendarId) {
      throw new TodoNotFoundError();
    }

    return TodoRto.fromEntity(todo);
  }

  async areThereTodosWithNotes(calendarId: number) {
    const count =
      await this.todoRepository.countTodosWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async createTodo(dto: CreateTodoDto) {
    await this.calendarService.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const created = await this.todoRepository.create(dto);

    return TodoRto.fromEntity(created);
  }

  async updateTodoNotes(dto: UpdateTodoDto) {
    const upd = await this.todoRepository.updateNotes(dto);

    if (typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return TodoRto.fromEntity(upd);
  }

  async moveTodo(dto: MoveTodoDto) {
    const upd = await this.todoRepository.updateDate(dto);

    if (typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return TodoRto.fromEntity(upd);
  }

  async updateTodoSetAsDone(dto: UpdateDoneTodoDto) {
    await this.calendarService.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const todo = await this.findTodoFromCalendar(dto.calendarId, dto.todoId);

    const doneDate = todo.date; // Always using the To-do Date as "default".

    const upd = await this.todoRepository.updateTodoDoneDate(
      todo.id,
      doneDate,
      dto,
    );

    if (typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return TodoRto.fromEntity(upd);
  }
}
