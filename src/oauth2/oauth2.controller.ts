import { Body, Controller, HttpStatus, Inject, Logger, Post, Req, Res } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import express from 'express';
import { NewClientDTO } from './dto/newClient.dto';
import { OAuth2TokenDTO } from './dto/oauth-token.dto';
import { Oauth2Service } from './services/oauth2.service';
import OAuth2Server from 'oauth2-server';
import { ClientService } from '@oauth2/services/client.service';
import { combineClientDataToTokenV2 } from '@oauth2/schema/client.schema';

@ApiTags('oauth2')
@Controller('oauth2')
export class Oauth2Controller {
  private logger = new Logger(Oauth2Controller.name);
  constructor(
    private oauth2Service: Oauth2Service,
    private clientServiceV2: ClientService,
    @Inject(REQUEST) private requestCtx: express.Request
  ) {}

  @ApiOperation({
    summary: 'Sign in',
    description: 'Sign in with Oauth2'
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('token')
  async token(
    @Body() oauthTokenDTO: OAuth2TokenDTO,
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    const { client_id, client_secret } = oauthTokenDTO;

    await this.clientServiceV2.findClientApp({
      clientId: oauthTokenDTO.client_id,
      clientSecret: oauthTokenDTO.client_secret
    });

    req.headers.authorization = `Basic ${combineClientDataToTokenV2(client_id, client_secret)}`;

    this.logger.debug(req.headers);

    const tokenResult: OAuth2Server.Token = await this.oauth2Service.handleToken(req, res);

    return res.status(HttpStatus.CREATED).json(tokenResult);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success created client app'
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'The created client app has been existed'
  })
  @ApiOperation({ summary: 'Register new client' })
  @Post('client')
  async newClient(@Body() newClientDTO: NewClientDTO, @Res() res: express.Response) {
    const newClientApp = await this.oauth2Service.handleCreateNewClient(newClientDTO);

    this.logger.log(newClientApp);

    return res.status(HttpStatus.CREATED).json(newClientApp);
  }
}
