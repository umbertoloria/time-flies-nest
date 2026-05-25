import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from './todo.repository';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';

@Injectable()
export class TodoService {
  constructor(private repository: TodoRepository) {}

  readUndoneTodosByCalendars(calendarIds: number[]) {
    return this.repository.findTodosFromCalendars(calendarIds);
  }

  readUndoneTodosByCalendar(calendarId: number, filterDate: string) {
    return this.repository.readUndoneTodosByCalendar(calendarId, filterDate);
  }

  async readTodo(calendarId: number, todoId: number) {
    const todo = await this.repository.findTodo(calendarId, todoId);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async areThereTodosWithNotes(calendarId: number) {
    const result = await this.repository.countTodosFromCalendar(calendarId);
    return result > 0;
  }

  async createTodo(dto: CreateTodoDto) {
    // TODO: Verify calendar is user's
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
    const dbTodo = await this.readTodo(dto.calendarId, dto.todoId);
    // TODO: Verify calendar is user's

    const doneDate = dbTodo.date; // Always using the To-do Date as "default".

    const upd = await this.repository.updateTodoDoneDate(
      dbTodo.id,
      doneDate,
      dto,
    );

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return upd;
  }
}
