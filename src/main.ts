import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { startHonoServer } from './hono/server.hono';

export const PORT = parseInt('' + process.env.PORT, 10);

export const corsAllowedOrigins =
  process.env.CORS_ORIGINS_WHITELIST?.split(',') || [];

async function bootstrap() {
  startHonoServer(PORT);

  const app = await NestFactory.create(AppModule, {
    /*httpsOptions: {
      key: fs.readFileSync('./secrets/server.key'),
      cert: fs.readFileSync('./secrets/server.cert'),
    },*/
  });

  app.enableCors({
    origin: (origin: any, callback: any) => {
      // console.debug('corsAllowedOrigins');
      // console.debug(corsAllowedOrigins);
      if (corsAllowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error('CORS filter blocked request from origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,POST,PUT,DELETE',
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // await app.listen(PORT);
  // FIXME
  await app.listen(2255);

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
