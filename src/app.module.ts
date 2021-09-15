import { AuthModule } from '@auth/auth.module';
import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Oauth2Module } from '@oauth2/oauth2.module';
import { AllExceptionFilter } from '@shared/exception.filter';
import { LoggingInterceptor } from '@shared/interceptor/logging.interceptor';
import { RavenInterceptor } from 'nest-raven';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MongooseModule.forRoot(process.env.DB_URI_CONNECTION), AuthModule, Oauth2Module],
  controllers: [AppController],
  // exports: [JwtModule],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter
    },
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
  ]
})
export class AppModule {}
