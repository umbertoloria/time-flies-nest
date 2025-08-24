import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type'], // Specify allowed headers
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
