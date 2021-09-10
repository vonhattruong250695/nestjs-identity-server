import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Oauth2Controller } from './oauth2.controller';
import { ClientModel, ClientSchema } from './schema/client.schema';
import { Oauth2ModelService } from './services/oauth2-model.service';
import { Oauth2Service } from './services/oauth2.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClientModel.name, schema: ClientSchema },
    ]),
  ],
  controllers: [Oauth2Controller],
  providers: [Oauth2ModelService, Oauth2Service],
})
export class Oauth2Module {}
