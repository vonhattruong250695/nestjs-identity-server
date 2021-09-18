import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { NewClientDTO } from '@oauth2/dto/newClient.dto';
import express from 'express';
import { LeanDocument } from 'mongoose';
import { Oauth2ModelService } from './oauth2-model.service';
import { ClientModel } from '@oauth2/schema/client.schema';
import { ClientService } from '@oauth2/services/client.service';
import OAuth2Server = require('@truongvn/oauth2-server');

@Injectable()
export class Oauth2Service {
  public oauthApp: OAuth2Server;
  private logger = new Logger(Oauth2ModelService.name);
  constructor(
    private oauth2ModelService: Oauth2ModelService,
    private clientServiceV2: ClientService
  ) {
    this.oauthApp = new OAuth2Server({
      model: this.oauth2ModelService,
      accessTokenLifetime: 60 * 60
    });
  }

  async handleCreateNewClient(newClientDTO: NewClientDTO): Promise<LeanDocument<ClientModel>> {
    await this.clientServiceV2.checkClientAppExist(newClientDTO.clientId);

    return this.clientServiceV2.handleCreateNewClient(newClientDTO);
  }

  async handleToken(req: express.Request, res: express.Response): Promise<OAuth2Server.Token> {
    try {
      const request = new OAuth2Server.Request(req);
      const response = new OAuth2Server.Response(res);

      return this.oauthApp.token(request, response);
    } catch (e) {
      this.logger.error(`handleToken error`);
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async handleAuthorize(
    req: express.Request,
    res: express.Response
  ): Promise<OAuth2Server.AuthorizationCode> {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);
    try {
      return await this.oauthApp.authorize(request, response);
    } catch (e) {
      this.logger.error(`handleAuthorize error => ${e}`);
      throw new InternalServerErrorException();
    }
  }

  async handleAuthenticateRequest(
    req: express.Request,
    res: express.Response
  ): Promise<OAuth2Server.Token> {
    const request = new OAuth2Server.Request(req);
    const response = new OAuth2Server.Response(res);
    try {
      const result = await this.oauthApp.authenticate(request, response);

      return JSON.parse(JSON.stringify(result));
    } catch (e) {
      this.logger.error(`handleAuthenticateRequest error => ${e}`);
      throw new InternalServerErrorException();
    }
  }
}
