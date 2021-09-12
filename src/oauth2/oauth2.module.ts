import { Module } from '@nestjs/common';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2ModelService } from './services/oauth2-model.service';
import { Oauth2Service } from './services/oauth2.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientServiceV2 } from '@oauth2/services/client-v2.service';
import { ClientModelV2, ClientSchemaV2 } from '@oauth2/schema/client-v2.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ClientModelV2.name, schema: ClientSchemaV2 }])],
  controllers: [Oauth2Controller],
  providers: [Oauth2ModelService, Oauth2Service, ClientServiceV2]
})
export class Oauth2Module {}
