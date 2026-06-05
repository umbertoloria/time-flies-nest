import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarService } from '../calendar/calendar.service';
import { TodoRepository } from './todo.repository';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoRto } from './rto';

@Injectable()
export class TodoService {
  constructor(
    private repository: TodoRepository,
    private calendarService: CalendarService,
  ) {}

  async findUndoneTodosByCalendars(calendarIds: number[]): Promise<TodoRto[]> {
    const todos = await this.repository.findTodosFromCalendars(calendarIds);

    return todos.map(TodoRto.fromEntity);
  }

  async findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<TodoRto[]> {
    const undoneTodos = await this.repository.findUndoneTodosByCalendar(
      calendarId,
      filterDate,
    );

    return undoneTodos.map(TodoRto.fromEntity);
  }

  async findTodoFromCalendar(calendarId: number, todoId: number) {
    const todo = await this.repository.findById(todoId);

    if (!todo || todo.calendar_id !== calendarId) {
      throw new NotFoundException('Todo not found');
    }

    return TodoRto.fromEntity(todo);
  }

  async areThereTodosWithNotes(calendarId: number) {
    const count =
      await this.repository.countTodosWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async createTodo(dto: CreateTodoDto) {
    await this.calendarService.findCalendarFromUser(
      dto.calendarId,
      dto.user.id,
    );

    const created = await this.repository.create(dto);

    return TodoRto.fromEntity(created);
  }

  async updateTodoNotes(dto: UpdateTodoDto) {
    const upd = await this.repository.updateNotes(dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return TodoRto.fromEntity(upd);
  }

  async moveTodo(dto: MoveTodoDto) {
    const upd = await this.repository.updateDate(dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
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

    const upd = await this.repository.updateTodoDoneDate(
      todo.id,
      doneDate,
      dto,
    );

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return TodoRto.fromEntity(upd);
  }
}
