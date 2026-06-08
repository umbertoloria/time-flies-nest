import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TodoController } from './modules/todo/dependent/todo.controller';

@Module({
  imports: [
    //
    ConfigModule.forRoot(),
  ],
  controllers: [
    // Order is important here!
    TodoController,
  ],
  providers: [],
})
export class AppModule {}
