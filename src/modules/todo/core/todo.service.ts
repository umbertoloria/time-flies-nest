import { ITodoRepository } from './itodo.repository';
import { CalendarService } from '@app/calendar/core/calendar.service';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoEntity } from './entity';
import { TodoNotFoundError } from './errors';

export class TodoService {
  constructor(
    private todoRepository: ITodoRepository,
    private calendarService: CalendarService,
  ) {}

  findUndoneTodosByCalendars(calendarIds: number[]): Promise<TodoEntity[]> {
    return this.todoRepository.findTodosFromCalendars(calendarIds);
  }

  findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<TodoEntity[]> {
    return this.todoRepository.findUndoneTodosByCalendar(
      calendarId,
      filterDate,
    );
  }

  async findTodoFromCalendar(calendarId: number, todoId: number) {
    const todo = await this.todoRepository.findById(todoId);

    if (!todo || todo.calendarId !== calendarId) {
      throw new TodoNotFoundError();
    }

    return todo;
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

    return await this.todoRepository.create(dto);
  }

  async updateTodoNotes(dto: UpdateTodoDto): Promise<TodoEntity> {
    const upd = await this.todoRepository.updateNotes(dto);

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return upd;
  }

  async moveTodo(dto: MoveTodoDto): Promise<TodoEntity> {
    const upd = await this.todoRepository.updateDate(dto);

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return upd;
  }

  async updateTodoSetAsDone(dto: UpdateDoneTodoDto): Promise<TodoEntity> {
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

    if (!upd || typeof upd !== 'object') {
      throw new TodoNotFoundError();
    }

    return upd;
  }
}
