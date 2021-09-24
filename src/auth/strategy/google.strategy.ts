import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { IGoogleStrategyResponse } from '@auth/interfaces/google-strategy-response.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private logger = new Logger(GoogleStrategy.name);
  constructor() {
    super({
      clientID: process.env.OAUTH2_GOOGLE_CLIENT_ID,
      clientSecret: process.env.OAUTH2_GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.OAUTH2_GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IGoogleStrategyResponse,
    done: VerifyCallback
  ): Promise<any> {
    // const { name, emails, photos } = profile;
    // this.logger.debug(profile);
    this.logger.debug(`accessToken => ${accessToken}`);

    const user = {
      ...profile,
      accessToken
    };

    done(null, user);
  }
}
