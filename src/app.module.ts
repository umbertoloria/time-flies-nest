import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarController } from './modules/calendar/dependent/calendar.controller';
import { TaskController } from './modules/task/task.controller';
import { TodoController } from './modules/todo/todo.controller';
import { TaskService } from './modules/task/task.service';
import { TodoService } from './modules/todo/todo.service';
import { TaskRepository } from './modules/task/task.repository';

@Module({
  imports: [
    //
    ConfigModule.forRoot(),
  ],
  controllers: [
    // Order is important here!
    TaskController,
    TodoController,
    CalendarController,
  ],
  providers: [
    //
    TaskRepository,
    TaskService,
    TodoService,
  ],
})
export class AppModule {}
