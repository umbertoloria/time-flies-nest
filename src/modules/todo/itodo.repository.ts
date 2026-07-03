import { TodoEntity } from './entity';
import {
  CreateTodoDto,
  MoveTodoDto,
  ReadTodosFromDateDto,
  UpdateDoneTodoDto,
  UpdateTodoDto,
} from './dto';

export interface ITodoRepository {
  findUndoneTodosByCalendarIds(calendarIds: number[]): Promise<TodoEntity[]>;

  findUndoneTodosByCalendar(dto: ReadTodosFromDateDto): Promise<TodoEntity[]>;

  findTodo(calendarId: number, todoId: number): Promise<TodoEntity | null>;

  countTodosWithNotesFromCalendar(calendarId: number): Promise<number>;

  create(dto: CreateTodoDto): Promise<TodoEntity>;

  updateNotes(dto: UpdateTodoDto): Promise<TodoEntity>;

  updateDate(dto: MoveTodoDto): Promise<TodoEntity>;

  updateTodoDoneDate(
    dto: UpdateDoneTodoDto,
    doneDate: string,
  ): Promise<TodoEntity>;
}
