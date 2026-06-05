import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const PORT = parseInt('' + process.env.PORT, 10);
// const ADDRESS = process.env.ADDRESS;

const originWhitelist = (process.env.CORS_ORIGINS_WHITELIST || '').split(',');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    /*httpsOptions: {
      key: fs.readFileSync('./secrets/server.key'),
      cert: fs.readFileSync('./secrets/server.cert'),
    },*/
  });

  app.enableCors({
    origin: (origin: any, callback: any) => {
      /*
      console.debug('originWhitelist');
      console.debug(originWhitelist);
      console.debug('request from origin', origin);
      console.debug('NODE_ENV:', process.env.NODE_ENV);
      if (process.env.NODE_ENV === 'development' && !origin) {
        callback(null, true);
      }
      */
      if (originWhitelist.indexOf(origin) !== -1) {
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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(PORT);

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
