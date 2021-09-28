import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { IFacebookAuthResponse } from '@auth/interfaces/facebook-auth-response.interface';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private logger = new Logger(FacebookStrategy.name);
  constructor() {
    super({
      clientID: process.env.OAUTH2_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.OAUTH2_FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.OAUTH2_FACEBOOK_CALLBACK_URL,
      scope: 'email',
      profileFields: ['emails', 'name', 'photos']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IFacebookAuthResponse,
    done: (err: any, user: any, info?: any) => void
  ): Promise<any> {
    const user = {
      ...profile,
      accessToken
    };

    done(null, user);
  }
}
