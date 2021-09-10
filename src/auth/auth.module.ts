import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientModel, ClientSchema } from '@oauth2/schema/client.schema';
import { Oauth2ModelService } from '@oauth2/services/oauth2-model.service';
import { Oauth2Service } from '@oauth2/services/oauth2.service';
import { AuthController } from './auth.controller';
import {
  SocialLoginModel,
  SocialLoginSchema
} from './schema/social-login.schema';
import { UserModel, UserSchema } from './schema/user.schema';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: ClientModel.name, schema: ClientSchema },
      {
        name: SocialLoginModel.name,
        schema: SocialLoginSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, Oauth2Service, Oauth2ModelService],
})
export class AuthModule {}
