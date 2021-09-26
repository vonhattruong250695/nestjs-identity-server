import { RegisterDTO } from '@auth/dto/register.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as swagger from '@nestjs/swagger';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import express from 'express';
import { Model } from 'mongoose';
import { UserModel } from './schema/user.schema';
import { AuthService } from '@auth/services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IGoogleStrategyResponse } from '@auth/interfaces/google-strategy-response.interface';
import { ClientService } from '@oauth2/services/client.service';
import { REQUEST } from '@nestjs/core';
import { NewSocialLoginDTO } from '@auth/dto/new-social-login.dto';
import { AuthError } from '@auth/constants/auth.error';
import { SocialTypeEnum } from '@auth/schema/social-login.schema';

@Controller('auth')
@swagger.ApiTags('auth')
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
  @UseGuards(AuthGuard('google'))
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
    // const { clientId, clientSecret } = query;
    const clientId = 'W21RKhZkWG92eESlKzoOGfQOvMBy6uanEm7C9lRUvO4=';
    const clientSecret = 'c5ead6aa52c5adcc77d23de2489a5fb9f4b50b930425ee0b182efb3ee6abdb2e';

    if (!req.user) {
      throw new NotFoundException(AuthError.UserNotFoundFromSocial);
    }

    const { id: socialId } = req.user;

    const [socialLoginDoc, clientApp] = await Promise.all([
      this.authService.getSocialInfo(socialId),
      this.clientService.findClientApp({ clientId, clientSecret })
    ]);

    if (socialLoginDoc) {
      const userInfoBySocialLogin = await this.authService.getUserInfoBySocialId(
        socialLoginDoc._id
      );

      const clientToken = await this.authService.handleResponseUserToken(
        userInfoBySocialLogin,
        clientApp
      );

      return res.status(HttpStatus.OK).json(clientToken);
    }

    const newSocialLoginDTO = new NewSocialLoginDTO({
      socialId: req.user.id,
      userSocialResponse: req.user,
      socialType: SocialTypeEnum.Google
    });

    const socialLogin = await this.authService.createNewSocialLogin(newSocialLoginDTO);

    const createUserDTO = new RegisterDTO().fromUserSocial({
      ...req.user,
      clientSecret: clientSecret,
      clientId: clientId,
      socialObjectId: socialLogin._id
    });

    const user = await this.authService.registerUser(createUserDTO);

    const clientToken = await this.authService.handleResponseUserToken(user, clientApp);

    return res.status(HttpStatus.OK).json(clientToken);
  }
}
