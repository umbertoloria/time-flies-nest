import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

const APP_PORT = 8443 as const;
const ORIGINS_WHITELIST = [
  'http://localhost:3000',
  'http://umbertoloria.com:80',
  'https://umbertoloria.com:443',
] as const;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: fs.readFileSync('./secrets/server.key'),
      cert: fs.readFileSync('./secrets/server.cert'),
    },
  });

  app.enableCors({
    origin: (origin: any, callback: any) => {
      if (!origin || ORIGINS_WHITELIST.indexOf(origin) !== -1) {
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

  await app.listen(APP_PORT);
}

bootstrap();
