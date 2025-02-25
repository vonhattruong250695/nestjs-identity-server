import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { SocialLoginModel, SocialLoginSchema } from './schema/social-login.schema';
import { UserModel, UserSchema } from './schema/user.schema';
import { AuthService } from './services/auth.service';
import { ClientModel, ClientSchema } from '@oauth2/schema/client.schema';
import { ClientTokenModel, ClientTokenSchema } from '@oauth2/schema/client-token.schema';
import { ClientService } from '@oauth2/services/client.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: ClientModel.name, schema: ClientSchema },
      { name: ClientTokenModel.name, schema: ClientTokenSchema },
      {
        name: SocialLoginModel.name,
        schema: SocialLoginSchema
      }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, ClientService]
})
export class AuthModule {}
