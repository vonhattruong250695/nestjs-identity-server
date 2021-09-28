import { AuthModule } from '@auth/auth.module';
import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Oauth2Module } from '@oauth2/oauth2.module';
import { LoggingInterceptor } from '@shared/interceptor/logging.interceptor';
import { RavenInterceptor } from 'nest-raven';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionFilter } from '@shared/exception.filter';

const isProductionMode = process.env.NODE_ENV === 'production';

const providersInit = [
  AppService,
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor
  },
  {
    provide: APP_INTERCEPTOR,
    useValue: new RavenInterceptor({
      filters: [
        {
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus()
        }
      ]
    })
  }
];

const providers = isProductionMode
  ? [
      ...providersInit,
      {
        provide: APP_FILTER,
        useClass: AllExceptionFilter
      }
    ]
  : providersInit;

@Module({
  imports: [MongooseModule.forRoot(process.env.DB_URI_CONNECTION), AuthModule, Oauth2Module],
  controllers: [AppController],
  providers
})
export class AppModule {}
