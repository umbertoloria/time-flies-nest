import { Injectable, NotFoundException } from '@nestjs/common';
import { calendarService } from '../calendar/core/calendar.service';
import { todoRepository } from './todo.repository';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoRto } from './rto';

@Injectable()
export class TodoService {
  async findUndoneTodosByCalendars(calendarIds: number[]): Promise<TodoRto[]> {
    const todos = await todoRepository.findTodosFromCalendars(calendarIds);

    return todos.map(TodoRto.fromEntity);
  }

  async findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<TodoRto[]> {
    const undoneTodos = await todoRepository.findUndoneTodosByCalendar(
      calendarId,
      filterDate,
    );

    return undoneTodos.map(TodoRto.fromEntity);
  }

  async findTodoFromCalendar(calendarId: number, todoId: number) {
    const todo = await todoRepository.findById(todoId);

    if (!todo || todo.calendar_id !== calendarId) {
      throw new NotFoundException('Todo not found');
    }

    return TodoRto.fromEntity(todo);
  }

  async areThereTodosWithNotes(calendarId: number) {
    const count =
      await todoRepository.countTodosWithNotesFromCalendar(calendarId);

    return count > 0;
  }

  async createTodo(dto: CreateTodoDto) {
    await calendarService.findCalendarFromUser(dto.calendarId, dto.user.id);

    const created = await todoRepository.create(dto);

    return TodoRto.fromEntity(created);
  }

  async updateTodoNotes(dto: UpdateTodoDto) {
    const upd = await todoRepository.updateNotes(dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return TodoRto.fromEntity(upd);
  }

  async moveTodo(dto: MoveTodoDto) {
    const upd = await todoRepository.updateDate(dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return TodoRto.fromEntity(upd);
  }

  async updateTodoSetAsDone(dto: UpdateDoneTodoDto) {
    await calendarService.findCalendarFromUser(dto.calendarId, dto.user.id);

    const todo = await this.findTodoFromCalendar(dto.calendarId, dto.todoId);

    const doneDate = todo.date; // Always using the To-do Date as "default".

    const upd = await todoRepository.updateTodoDoneDate(todo.id, doneDate, dto);

    if (typeof upd !== 'object') {
      throw new NotFoundException('Todo not found');
    }

    return TodoRto.fromEntity(upd);
  }
}
