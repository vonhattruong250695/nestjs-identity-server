import { Module } from '@nestjs/common';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2ModelService } from './services/oauth2-model.service';
import { Oauth2Service } from './services/oauth2.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientService } from '@oauth2/services/client.service';
import { ClientModel, ClientSchema } from '@oauth2/schema/client.schema';
import { ClientTokenModel, ClientTokenSchema } from '@oauth2/schema/client-token.schema';
import { AuthService } from '@auth/services/auth.service';
import { UserModel, UserSchema } from '@auth/schema/user.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { SocialLoginModel, SocialLoginSchema } from '@auth/schema/social-login.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME
        },
        secret: process.env.JWT_ACCESS_TOKEN_SECRET
      })
    }),
    MongooseModule.forFeature([
      { name: ClientModel.name, schema: ClientSchema },
      { name: ClientTokenModel.name, schema: ClientTokenSchema },
      { name: UserModel.name, schema: UserSchema },
      {
        name: SocialLoginModel.name,
        schema: SocialLoginSchema
      }
    ])
  ],
  controllers: [Oauth2Controller],
  providers: [
    Oauth2ModelService,
    Oauth2Service,
    ClientService,
    AuthService,
    {
      provide: JWT_MODULE_OPTIONS,
      useValue: JwtService
    }
  ],
  exports: [Oauth2ModelService, ClientService]
})
export class Oauth2Module {}
