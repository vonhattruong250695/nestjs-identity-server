import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { SocialLoginModel, SocialLoginSchema } from './schema/social-login.schema';
import { UserModel, UserSchema } from './schema/user.schema';
import { AuthService } from './services/auth.service';
import { Oauth2ModelService } from '@oauth2/services/oauth2-model.service';
import { ClientService } from '@oauth2/services/client.service';
import { ClientModel, ClientSchema } from '@oauth2/schema/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: ClientModel.name, schema: ClientSchema },
      {
        name: SocialLoginModel.name,
        schema: SocialLoginSchema
      }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, Oauth2ModelService, ClientService]
})
export class AuthModule {}
