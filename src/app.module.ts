import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { RavenInterceptor } from 'nest-raven';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Oauth2Module } from './oauth2/oauth2.module';
import { Oauth2ModelService } from './oauth2/services/oauth2-model.service';
import { AllExceptionFilter } from './shared/exception.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';

console.log("🚀 ~ file: app.module.ts ~ line 14 ~ process.env.DB_URI_CONNECTION", process.env.DB_URI_CONNECTION)
@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URI_CONNECTION),
    AuthModule,
    Oauth2Module,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        filters: [
          {
            type: HttpException,
            filter: (exception: HttpException) => 500 > exception.getStatus(),
          },
        ],
      }),
    },
    Oauth2ModelService,
  ],
})
export class AppModule {}
