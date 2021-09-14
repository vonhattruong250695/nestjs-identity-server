import { Module } from '@nestjs/common';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2ModelService } from './services/oauth2-model.service';
import { Oauth2Service } from './services/oauth2.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientService } from '@oauth2/services/client.service';
import { ClientModel, ClientSchema } from '@oauth2/schema/client.schema';
import { ClientTokenModel, ClientTokenSchema } from '@oauth2/schema/client-token.schema';
import { ClientTokenService } from '@oauth2/services/client-token.service';
import { AuthService } from '@auth/services/auth.service';
import { UserModel, UserSchema } from '@auth/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClientModel.name, schema: ClientSchema },
      { name: ClientTokenModel.name, schema: ClientTokenSchema },
      { name: UserModel.name, schema: UserSchema }
    ])
  ],
  controllers: [Oauth2Controller],
  providers: [Oauth2ModelService, Oauth2Service, ClientService, ClientTokenService, AuthService]
})
export class Oauth2Module {}
