import { RegisterDTO } from '@auth/dto/register.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import express from 'express';
import { Model } from 'mongoose';
import { UserModel } from './schema/user.schema';
import { AuthService } from '@auth/services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IGoogleStrategyResponse } from '@auth/interfaces/google-auth-response.interface';
import { ClientService } from '@oauth2/services/client.service';
import { REQUEST } from '@nestjs/core';
import { AuthError } from '@auth/constants/auth.error';
import { SocialTypeEnum } from '@auth/schema/social-login.schema';
import { GoogleAuthGuard } from '@auth/guards/google-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    @InjectModel(UserModel.name) public userModel: Model<UserModel>,

    @Inject(REQUEST) private requestCtx: express.Request
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'User register' })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client Not found'
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatus.NOT_MODIFIED,
    description: 'Failed created'
  })
  @ApiCreatedResponse({
    description: 'Successful created user',
    status: HttpStatus.CREATED
  })
  async register(@Body() registerDto: RegisterDTO, @Res() res: express.Response) {
    const newUser = await this.authService.registerUser(registerDto);

    const { password: _, ...user } = newUser;

    return res.status(HttpStatus.CREATED).json(user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() _: express.Request) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req()
    req: express.Request & {
      user: IGoogleStrategyResponse;
    },
    @Res() res: express.Response
  ) {
    const googleAuthToken = await this.authService.handleSocialAuthRedirect({
      req,
      socialType: SocialTypeEnum.Google
    });

    return res.status(HttpStatus.OK).json(googleAuthToken);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthenticate(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(
    @Req()
    req: express.Request & {
      user: IGoogleStrategyResponse;
    },
    @Res() res: express.Response
  ): Promise<any> {
    const facebookAuthToken = await this.authService.handleSocialAuthRedirect({
      req,
      socialType: SocialTypeEnum.Facebook
    });

    return res.status(HttpStatus.OK).json(facebookAuthToken);
  }

  @Get(':type/before-auth')
  async socialBeforeAuth(
    @Param('type') socialType: string,
    @Query('clientId') clientId: string,
    @Query('clientSecret') clientSecret: string,
    @Res() res: express.Response
  ) {
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(AuthError.MissingClientData);
    }

    res.cookie('clientId', clientId, { maxAge: +process.env.COMMON_COOKIE_EXPIRY });
    res.cookie('clientSecret', clientSecret, { maxAge: +process.env.COMMON_COOKIE_EXPIRY });
    return res.redirect(`/auth/${socialType}`);
  }
}
