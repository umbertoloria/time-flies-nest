import { TodoEntity } from './entity';
import {
  CreateTodoDto,
  MoveTodoDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';

export interface ITodoRepository {
  findTodosFromCalendars(calendarIds: number[]): Promise<TodoEntity[]>;

  findUndoneTodosByCalendar(
    calendarId: number,
    filterDate: string,
  ): Promise<TodoEntity[]>;

  findById(todoId: number): Promise<TodoEntity | null>;

  countTodosWithNotesFromCalendar(calendarId: number): Promise<number>;

  create(dto: CreateTodoDto): Promise<TodoEntity>;

  updateNotes(dto: UpdateTodoDto): Promise<TodoEntity>;

  updateDate(dto: MoveTodoDto): Promise<TodoEntity | null>;

  updateTodoDoneDate(
    todoId: number,
    doneDate: string,
    dto: UpdateDoneTodoDto,
  ): Promise<TodoEntity>;
}
