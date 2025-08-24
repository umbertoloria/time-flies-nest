import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const whitelist = [
  'http://localhost:3000',
  'http://umbertoloria.com:80',
  'https://umbertoloria.com:443',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin: any, callback: any) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(null, true);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type'], // Specify allowed headers
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
