import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { SocialLoginModel, SocialLoginSchema } from './schema/social-login.schema';
import { UserModel, UserSchema } from './schema/user.schema';
import { AuthService } from './services/auth.service';
import { ClientModel, ClientSchema } from '@oauth2/schema/client.schema';
import { ClientTokenModel, ClientTokenSchema } from '@oauth2/schema/client-token.schema';
import { ClientService } from '@oauth2/services/client.service';
import { GoogleStrategy } from '@auth/strategy/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { JwtStrategy } from '@auth/strategy/jwt.strategy';
import { Oauth2ModelService } from '@oauth2/services/oauth2-model.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME
      },
      secret: process.env.JWT_ACCESS_TOKEN_SECRET
    }),
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
  providers: [
    AuthService,
    ClientService,
    Oauth2ModelService,
    GoogleStrategy,
    JwtStrategy,
    {
      provide: JWT_MODULE_OPTIONS,
      useValue: JwtService
    }
  ],
  exports: [AuthService, ClientService]
})
export class AuthModule {}
