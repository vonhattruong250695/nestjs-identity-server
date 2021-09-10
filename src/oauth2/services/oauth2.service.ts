import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Oauth2Error } from '@oauth2/constants/oauth2.error';
import { NewClientDTO } from '@oauth2/dto/newClient.dto';
import { ClientModel, hashClientId, hashClientSecret } from '@oauth2/schema/client.schema';
import express from 'express';
import { LeanDocument, Model } from 'mongoose';
import OAuth2Server from 'oauth2-server';
import { Oauth2ModelService } from './oauth2-model.service';

@Injectable()
export class Oauth2Service {
  public oauth2Server: OAuth2Server;
  private logger = new Logger(Oauth2ModelService.name);
  constructor(
    private oauth2ModelService: Oauth2ModelService,
    @InjectModel(ClientModel.name)
    public clientModel: Model<ClientModel>
  ) {}

  initOauthServer() {
    this.oauth2Server = new OAuth2Server({
      model: this.oauth2ModelService
    });
  }

  async findClientApp({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
    const clientApp = await this.clientModel.findOne({
      clientId,
      clientSecret
    });

    this.logger.log(clientApp);

    if (!clientApp) {
      throw new HttpException(Oauth2Error.ClientAppNotFound, HttpStatus.NOT_FOUND);
    }

    return clientApp.toJSON();
  }

  async handleCreateNewClient(newClientDTO: NewClientDTO): Promise<LeanDocument<ClientModel>> {
    const isExistClient = await this.clientModel
      .findOne({
        clientId: hashClientId(newClientDTO.clientId),
        clientSecret: hashClientSecret(newClientDTO.clientSecret)
      })
      .lean();

    if (isExistClient) {
      throw new HttpException(Oauth2Error.ClientAppExisted, HttpStatus.FOUND);
    }

    const clientAppDoc = new this.clientModel(newClientDTO);

    await clientAppDoc.save();

    return clientAppDoc.toJSON();
  }

  async handleToken(req: express.Request, res: express.Response): Promise<OAuth2Server.Token> {
    this.initOauthServer();
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);

    try {
      return await this.oauth2Server.token(request, response);
    } catch (e) {}
  }

  async handleAuthorize(
    req: express.Request,
    res: express.Response
  ): Promise<OAuth2Server.AuthorizationCode> {
    this.initOauthServer();
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);
    try {
      return await this.oauth2Server.authorize(request, response);
    } catch (e) {}
  }
}
