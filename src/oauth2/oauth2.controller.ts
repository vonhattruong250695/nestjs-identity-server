import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import express from 'express';
import OAuth2Server from 'oauth2-server';
import { NewClientDTO } from './dto/newClient.dto';
import { Oauth2Service } from './services/oauth2.service';

@ApiTags('oauth2')
@Controller('oauth2')
export class Oauth2Controller {
  private logger = new Logger(Oauth2Controller.name);
  constructor(
    private oauth2Service: Oauth2Service,
    @Inject(REQUEST) private requestCtx: express.Request,
  ) {}

  @ApiOperation({
    summary: 'Sign in',
    description: 'Sign in with Oauth2',
  })
  @ApiQuery({
    name: 'grant_type',
    enum: ['password', 'refresh_token', 'authorization_code'],
  })
  @ApiQuery({
    name: 'username',
    description: 'Email. If grant_type = password',
    required: false,
  })
  @ApiQuery({
    name: 'password',
    description: 'If grant_type = password',
    required: false,
  })
  @ApiQuery({
    name: 'code',
    description: 'If grant_type = authorization_code',
    required: false,
  })
  @ApiQuery({
    name: 'refresh_token',
    description: 'If grant_type = refresh_token',
    required: false,
  })
  @Post('token')
  async token(
    @Req() request: express.Request,
    @Res() response: express.Response,
  ) {
    const tokenResult: OAuth2Server.Token =
      await this.oauth2Service.handleToken(this.requestCtx, response);

    return response.json(HttpStatus.OK).json(tokenResult);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Success created client app',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'The created client app has been existed',
  })
  @ApiOperation({ summary: 'Register new client' })
  @Post('client')
  async newClient(
    @Body() newClientDTO: NewClientDTO,
    @Res() req: express.Response,
  ) {
    const newClientApp = await this.oauth2Service.handleCreateNewClient(
      newClientDTO,
    );

    this.logger.log(newClientApp);

    return req.status(HttpStatus.CREATED).json(newClientApp);
  }
}
