import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const APP_PORT = parseInt('' + process.env.APP_PORT || '8663', 10);
const APP_ADDRESS = process.env.APP_ADDRESS || '0.0.0.0';

const ORIGINS_WHITELIST = [
  'http://localhost:3000',
  // 'http://umbertoloria.com',
  'https://umbertoloria.com',
  'https://www.umbertoloria.com',
  'https://tfapi.umbertoloria.com',
] as const;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    /*httpsOptions: {
      key: fs.readFileSync('./secrets/server.key'),
      cert: fs.readFileSync('./secrets/server.cert'),
    },*/
  });

  app.enableCors({
    origin: (origin: any, callback: any) => {
      // console.log('request from origin', origin);
      if (!origin || ORIGINS_WHITELIST.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,POST,PUT,DELETE',
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true,
  });

  await app.listen(APP_PORT, APP_ADDRESS);

  const logger = new Logger('Bootstrap');
  const server = app.getHttpServer();
  const addressInfo = server.address();
  if (typeof addressInfo === 'object' && addressInfo !== null) {
    logger.log(
      `Application is running on: http://${addressInfo.address}:${addressInfo.port}`,
    );
  } else {
    logger.log(`Application is running on: ${addressInfo}`);
  }
}

bootstrap().catch(console.error);
