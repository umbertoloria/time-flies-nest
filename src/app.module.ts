import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { CalendarController } from './calendar/calendar.controller';
import { TaskController } from './task/task.controller';
import { TodoController } from './todo/todo.controller';
import { PrismaService } from './prisma.service';
import { TaskService } from './task.service';

@Module({
  imports: [
    //
    ConfigModule.forRoot(),
  ],
  controllers: [
    //
    AppController,
    AuthController,
    CalendarController,
    TaskController,
    TodoController,
  ],
  providers: [
    //
    PrismaService,
    TaskService,
  ],
})
export class AppModule {}
