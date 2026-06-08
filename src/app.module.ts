import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  ],
  providers: [],
})
export class AppModule {}
