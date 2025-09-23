import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    // Order is important here!
    AuthController,
    TaskController,
    TodoController,
    CalendarController,
  ],
  providers: [
    //
    PrismaService,
    TaskService,
  ],
})
export class AppModule {}
