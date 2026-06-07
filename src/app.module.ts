import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarController } from './modules/calendar/dependent/calendar.controller';
import { TaskController } from './modules/task/dependent/task.controller';
import { TodoController } from './modules/todo/dependent/todo.controller';

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
  providers: [],
})
export class AppModule {}
