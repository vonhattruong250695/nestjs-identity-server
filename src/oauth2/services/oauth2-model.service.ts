import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ClientService } from '@oauth2/services/client.service';
import { toOAuth2ServerClient } from '@oauth2/schema/client.schema';
import { Oauth2Error } from '@oauth2/constants/oauth2.error';
import { UserModel } from '@auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '@auth/services/auth.service';
import OAuth2Server = require('oauth2-server');

@Injectable()
export class Oauth2ModelService
  implements OAuth2Server.AuthorizationCodeModel, OAuth2Server.PasswordModel
{
  private logger = new Logger(Oauth2ModelService.name);

  constructor(
    private clientService: ClientService,
    private authService: AuthService,

    @InjectModel(UserModel.name) public userModel: Model<UserModel>
  ) {}

  async getUser(
    username: string,
    password: string,
    callback?: OAuth2Server.Callback<OAuth2Server.User | OAuth2Server.Falsey>
  ) {
    try {
      const user = await this.authService.getUserInfo(username, password);
      this.logger.debug(user);
      return user;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  generateAccessToken(
    client: OAuth2Server.Client,
    user: OAuth2Server.User,
    scope: string | string[],
    callback?: OAuth2Server.Callback<string>
  ): Promise<string> {
    this.logger.debug(client);
    return Promise.resolve('');
  }

  generateAuthorizationCode(
    client: OAuth2Server.Client,
    user: OAuth2Server.User,
    scope: string | string[],
    callback?: OAuth2Server.Callback<string>
  ): Promise<string> {
    return Promise.resolve('');
  }

  generateRefreshToken(
    client: OAuth2Server.Client,
    user: OAuth2Server.User,
    scope: string | string[],
    callback?: OAuth2Server.Callback<string>
  ): Promise<string> {
    this.logger.debug(client);
    return Promise.resolve('');
  }

  getAccessToken(
    accessToken: string,
    callback?: OAuth2Server.Callback<OAuth2Server.Token>
  ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    this.logger.log(accessToken);
    return Promise.resolve(undefined);
  }

  getAuthorizationCode(
    authorizationCode: string,
    callback?: OAuth2Server.Callback<OAuth2Server.AuthorizationCode>
  ): Promise<OAuth2Server.AuthorizationCode | OAuth2Server.Falsey> {
    return Promise.resolve(undefined);
  }

  async getClient(
    clientId: string,
    clientSecret: string
  ): Promise<OAuth2Server.Client | OAuth2Server.Falsey> {
    try {
      const result = await this.clientService.findClientApp({ clientId, clientSecret });

      return toOAuth2ServerClient(result);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(Oauth2Error.ClientAppExisted, HttpStatus.FOUND);
    }
  }

  revokeAuthorizationCode(
    code: OAuth2Server.AuthorizationCode,
    callback?: OAuth2Server.Callback<boolean>
  ): Promise<boolean> {
    this.logger.log(code);
    return Promise.resolve(false);
  }

  saveAuthorizationCode(
    code: Pick<
      OAuth2Server.AuthorizationCode,
      'authorizationCode' | 'expiresAt' | 'redirectUri' | 'scope'
    >,
    client: OAuth2Server.Client,
    user: OAuth2Server.User,
    callback?: OAuth2Server.Callback<OAuth2Server.AuthorizationCode>
  ): Promise<OAuth2Server.AuthorizationCode | OAuth2Server.Falsey> {
    this.logger.debug(client);
    return Promise.resolve(undefined);
  }

  saveToken(
    token: OAuth2Server.Token,
    client: OAuth2Server.Client,
    user: OAuth2Server.User,
    callback?: OAuth2Server.Callback<OAuth2Server.Token>
  ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    try {
      this.logger.debug(token);
      this.logger.debug(client);
      return Promise.resolve(undefined);
    } catch (e) {
      this.logger.error(e);
    }
  }

  validateScope(
    user: OAuth2Server.User,
    client: OAuth2Server.Client,
    scope: string | string[],
    callback?: OAuth2Server.Callback<string | OAuth2Server.Falsey>
  ): Promise<string | string[] | OAuth2Server.Falsey> {
    this.logger.log(user);
    return Promise.resolve(undefined);
  }

  verifyScope(
    token: OAuth2Server.Token,
    scope: string | string[],
    callback?: OAuth2Server.Callback<boolean>
  ): Promise<boolean> {
    this.logger.debug(token);
    return Promise.resolve(false);
  }
}
