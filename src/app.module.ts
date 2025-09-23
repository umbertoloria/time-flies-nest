import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { TaskService } from './task.service';
import { CalendarController } from './calendar/calendar.controller';
import { TodoController } from './todo/todo.controller';

@Module({
  imports: [
    //
    ConfigModule.forRoot(),
  ],
  controllers: [
    //
    AppController,
    CalendarController,
    TodoController,
  ],
  providers: [
    //
    PrismaService,
    TaskService,
  ],
})
export class AppModule {}
