import { Logger, RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';
import { AppNest } from './app.model';
import { AppModule } from './app.module';

const NOOP = () => null;

async function bootstrap() {
  const app: AppNest = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: 'oauth2/token',
        method: RequestMethod.POST
      }
    ]
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: {
        value: false
      },
      transform: true
    })
  );
  app.use(cookieParser());

  const options = new DocumentBuilder()
    .setTitle('Nestjs identity server')
    .setDescription('Nestjs identity server description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.enableVersioning({
    type: VersioningType.URI
  });

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.APP_PORT);

  Logger.log(`App is running on port ${process.env.APP_PORT}`);
}

bootstrap().then(NOOP);
