import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ClientService } from '@oauth2/services/client.service';
import { toOAuth2ServerClient } from '@oauth2/schema/client.schema';
import { Oauth2Error } from '@oauth2/constants/oauth2.error';
import { UserModel } from '@auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthService } from '@auth/services/auth.service';
import { ClientTokenModel } from '@oauth2/schema/client-token.schema';
import OAuth2Server = require('oauth2-server');

@Injectable()
export class Oauth2ModelService implements OAuth2Server.PasswordModel {
  private logger = new Logger(Oauth2ModelService.name);

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    @InjectModel(UserModel.name) public userModel: Model<UserModel>,
    @InjectModel(ClientTokenModel.name) public clientTokenModel: Model<ClientTokenModel>
  ) {}

  async saveToken(
    token: OAuth2Server.Token,
    client: OAuth2Server.Client,
    user: OAuth2Server.User
  ): Promise<OAuth2Server.Token | OAuth2Server.Falsey> {
    const clientTokenDoc = new this.clientTokenModel({
      user: (user as UserModel)._id,
      client: new Types.ObjectId(client.id),
      ...token
    });

    await clientTokenDoc.save();

    return clientTokenDoc.toObject();
  }

  getAccessToken(
    accessToken: string,
    callback?: OAuth2Server.Callback<OAuth2Server.Token>
  ): Promise<OAuth2Server.Falsey | OAuth2Server.Token> {
    throw new Error('Method getAccessToken not implemented.');
  }
  verifyScope(
    token: OAuth2Server.Token,
    scope: string | string[],
    callback?: OAuth2Server.Callback<boolean>
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getUser(
    username: string,
    password: string
  ): Promise<OAuth2Server.User | OAuth2Server.Falsey> {
    return this.authService.getUserInfo(username, password);
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
}
