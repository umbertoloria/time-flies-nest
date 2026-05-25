import { Injectable, NotFoundException } from '@nestjs/common';
import { CalendarService } from '../calendar/calendar.service';
import { TodoRepository } from './todo.repository';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';

@Injectable()
export class TodoService {
  constructor(
    private repository: TodoRepository,
    private calendarService: CalendarService,
  ) {}

  findUndoneTodosByCalendars(calendarIds: number[]) {
    return this.repository.findTodosFromCalendars(calendarIds);
  }

  findUndoneTodosByCalendar(calendarId: number, filterDate: string) {
    return this.repository.findUndoneTodosByCalendar(calendarId, filterDate);
  }

  async findTodoFromCalendar(calendarId: number, todoId: number) {
    const todo = await this.repository.findById(todoId);

    if (!todo || todo.calendar_id !== calendarId) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
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

    return this.repository.create(dto);
  }

  async updateTodoNotes(dto: UpdateTodoDto) {
    const upd = await this.repository.updateNotes(dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return upd;
  }

  async moveTodo(dto: MoveTodoDto) {
    const upd = await this.repository.updateDate(dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return upd;
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

    return upd;
  }
}
