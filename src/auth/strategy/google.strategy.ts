import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
    try {
      // const { name, emails, photos } = profile;
      // this.logger.debug(profile);
      this.logger.debug(`accessToken => ${accessToken}`);
      this.logger.debug(profile);

      const user = {
        ...profile,
        accessToken
      };

      done(null, user);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
