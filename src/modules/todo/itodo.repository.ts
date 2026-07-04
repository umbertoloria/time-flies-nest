import { TodoEntity } from './entity';
import {
  CreateTodoDto,
  ReadTodosFromDateDto,
  SetTodoAsDoneDto,
  UpdateTodoDto,
} from './dto';

export type TodoDate = {
  calendarId: number;
  date: string;
};

export interface ITodoRepository {
  findUndoneTodosByCalendarIds(calendarIds: number[]): Promise<TodoEntity[]>;

  findUndoneTodosDatesByCalendarIds(calendarIds: number[]): Promise<TodoDate[]>;

  findUndoneTodosByCalendar(dto: ReadTodosFromDateDto): Promise<TodoEntity[]>;

  findTodo(calendarId: number, todoId: number): Promise<TodoEntity | null>;

  countTodosWithNotesFromCalendar(calendarId: number): Promise<number>;

  create(dto: CreateTodoDto): Promise<TodoEntity>;

  update(dto: UpdateTodoDto): Promise<TodoEntity>;

  setAsDone(dto: SetTodoAsDoneDto): Promise<TodoEntity>;
}
