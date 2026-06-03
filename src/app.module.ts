import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarController } from './modules/calendar/calendar.controller';
import { TaskController } from './modules/task/task.controller';
import { TodoController } from './modules/todo/todo.controller';
import { PrismaRepository } from './prisma.repository';
import { TaskService } from './modules/task/task.service';
import { CalendarService } from './modules/calendar/calendar.service';
import { TodoService } from './modules/todo/todo.service';
import { CalendarRepository } from './modules/calendar/calendar.repository';
import { TodoRepository } from './modules/todo/todo.repository';
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
    PrismaRepository,
    TaskRepository,
    TaskService,
    CalendarRepository,
    CalendarService,
    TodoRepository,
    TodoService,
  ],
})
export class AppModule {}
