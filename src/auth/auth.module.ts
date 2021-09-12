import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { SocialLoginModel, SocialLoginSchema } from './schema/social-login.schema';
import { UserModel, UserSchema } from './schema/user.schema';
import { AuthService } from './services/auth.service';
import { Oauth2ModelService } from '@oauth2/services/oauth2-model.service';
import { ClientServiceV2 } from '@oauth2/services/client-v2.service';
import { ClientModelV2, ClientSchemaV2 } from '@oauth2/schema/client-v2.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: ClientModelV2.name, schema: ClientSchemaV2 },
      {
        name: SocialLoginModel.name,
        schema: SocialLoginSchema
      }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, Oauth2ModelService, ClientServiceV2]
})
export class AuthModule {}
