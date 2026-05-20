import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controllers/auth/auth.controller';
import { CalendarController } from './controllers/calendar/calendar.controller';
import { TaskController } from './controllers/task/task.controller';
import { TodoController } from './controllers/todo/todo.controller';
import { PrismaService } from './prisma.service';
import { TaskService } from './controllers/task/task.service';
import { UserService } from './controllers/auth/user.service';
import { CalendarService } from './controllers/calendar/calendar.service';
import { TodoService } from './controllers/todo/todo.service';

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
    UserService,
    CalendarService,
    TodoService,
  ],
})
export class AppModule {}
