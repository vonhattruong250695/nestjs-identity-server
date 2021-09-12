import { Injectable, Logger } from '@nestjs/common';
import { NewClientDTO } from '@oauth2/dto/newClient.dto';
import express from 'express';
import { LeanDocument } from 'mongoose';
import { Oauth2ModelService } from './oauth2-model.service';
import OAuth2Server = require('oauth2-server');
import { ClientModel } from '@oauth2/schema/client.schema';
import { ClientService } from '@oauth2/services/client.service';

@Injectable()
export class Oauth2Service {
  public oauth2Server: OAuth2Server;
  private logger = new Logger(Oauth2ModelService.name);
  constructor(
    private oauth2ModelService: Oauth2ModelService,
    private clientServiceV2: ClientService
  ) {
    this.oauth2Server = new OAuth2Server({
      model: this.oauth2ModelService,
      accessTokenLifetime: 60 * 60
    });
  }

  async handleCreateNewClient(newClientDTO: NewClientDTO): Promise<LeanDocument<ClientModel>> {
    await this.clientServiceV2.checkClientAppExist(newClientDTO.clientId);

    return this.clientServiceV2.handleCreateNewClient(newClientDTO);
  }

  async handleToken(req: express.Request, res: express.Response): Promise<OAuth2Server.Token> {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);

    return await this.oauth2Server.token(request, response);
  }

  async handleAuthorize(
    req: express.Request,
    res: express.Response
  ): Promise<OAuth2Server.AuthorizationCode> {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);
    try {
      return await this.oauth2Server.authorize(request, response);
    } catch (e) {}
  }
}
