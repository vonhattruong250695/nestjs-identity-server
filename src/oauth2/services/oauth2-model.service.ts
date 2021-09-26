import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ClientService } from '@oauth2/services/client.service';
import { toOAuth2ServerClient } from '@oauth2/schema/client.schema';
import { Oauth2Error } from '@oauth2/constants/oauth2.error';
import { UserModel } from '@auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from '@auth/services/auth.service';
import { ClientTokenModel } from '@oauth2/schema/client-token.schema';
import { Client, Falsey, User } from 'oauth2-server';
import OAuth2Server = require('@truongvn/oauth2-server');

@Injectable()
export class Oauth2ModelService
  implements
    OAuth2Server.PasswordModel,
    OAuth2Server.RefreshTokenModel,
    OAuth2Server.ClientCredentialsModel
{
  private logger = new Logger(Oauth2ModelService.name);

  constructor(
    private clientService: ClientService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @InjectModel(UserModel.name) public userModel: Model<UserModel>,
    @InjectModel(ClientTokenModel.name) public clientTokenModel: Model<ClientTokenModel>
  ) {}

  async saveToken(
    token: OAuth2Server.Token,
    client: OAuth2Server.Client,
    user: OAuth2Server.User
  ): Promise<OAuth2Server.Token> {
    this.logger.debug(`saveToken`);
    this.logger.debug(client.id);
    this.logger.debug(token);

    try {
      const clientTokenDoc = new this.clientTokenModel({
        user: (user as UserModel)._id,
        client: new Types.ObjectId(client.id),
        id: new Types.ObjectId(client.id),
        ...token
      });

      await clientTokenDoc.save();

      return clientTokenDoc.toObject();
    } catch (e) {
      this.logger.error(`saveToken error`);
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async getAccessToken(accessToken: string): Promise<OAuth2Server.Falsey | OAuth2Server.Token> {
    this.logger.debug(`getAccessToken`);
    return this.clientTokenModel.findOne({ accessToken });
  }

  async verifyScope(token: OAuth2Server.Token, scope: string | string[]): Promise<boolean> {
    return true;
  }

  async getUser(
    username: string,
    password: string
  ): Promise<OAuth2Server.User | OAuth2Server.Falsey> {
    this.logger.debug(`getUser`);
    return this.authService.getUserInfoByUserNameAndPassword(username, password);
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

  async getRefreshToken(
    refreshToken: string
  ): Promise<OAuth2Server.RefreshToken | OAuth2Server.Falsey> {
    try {
      const refreshTokenResult = await this.clientTokenModel
        .findOne({ refreshToken })
        .populate('client')
        .populate('user', '-password')
        .lean();

      refreshTokenResult.id = refreshTokenResult.id.toString();
      refreshTokenResult.client.id = refreshTokenResult.client._id.toString();

      return refreshTokenResult;
    } catch (e) {
      this.logger.error(`getRefreshToken error => ${e}`);
      throw new InternalServerErrorException();
    }
  }

  async revokeToken(token: OAuth2Server.RefreshToken | OAuth2Server.Token): Promise<boolean> {
    const deleteResult = await this.clientTokenModel.deleteOne({
      refreshToken: token.refreshToken
    });

    return !!deleteResult.deletedCount;
  }

  async getUserFromClient(client: Client): Promise<User | Falsey> {
    const result = await this.clientService.findClientAppByClientId({ clientId: client.id });

    return toOAuth2ServerClient(result);
  }

  async getClientTokenModelByUserId(userId: string): Promise<OAuth2Server.Token> {
    return this.clientTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
  }
}
