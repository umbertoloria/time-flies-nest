import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './modules/auth/auth.controller';
import { CalendarController } from './modules/calendar/calendar.controller';
import { TaskController } from './modules/task/task.controller';
import { TodoController } from './modules/todo/todo.controller';
import { PrismaRepository } from './prisma.repository';
import { TaskService } from './modules/task/task.service';
import { AuthService } from './modules/auth/auth.service';
import { CalendarService } from './modules/calendar/calendar.service';
import { TodoService } from './modules/todo/todo.service';

@Module({
  imports: [
    //
    ConfigModule.forRoot(),
  ],
  controllers: [
    // Order is important here!
    AuthController,
    TaskController,
    TodoController,
    CalendarController,
  ],
  providers: [
    PrismaRepository,
    TaskService,
    AuthService,
    CalendarService,
    TodoService,
  ],
})
export class AppModule {}
