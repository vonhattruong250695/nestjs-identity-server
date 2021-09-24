import { RegisterDTO } from '@auth/dto/register.dto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Query,
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
import { GoogleRedirectDTO } from '@auth/dto/google-redirect.dto';
import { ClientService } from '@oauth2/services/client.service';
import { AuthError } from '@auth/constants/auth.error';
import { NewSocialLoginDTO } from '@auth/dto/new-social-login.dto';
import { SocialTypeEnum } from '@auth/schema/social-login.schema';

@Controller('auth')
@swagger.ApiTags('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    @InjectModel(UserModel.name) public userModel: Model<UserModel>
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
  async googleAuth(@Req() req: express.Request) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req()
    req: express.Request & {
      user: IGoogleStrategyResponse;
    },
    @Query() query: GoogleRedirectDTO,
    @Res() res: express.Response
  ) {
    const { clientId, clientSecret } = query;

    if (!req.user) {
      throw new NotFoundException(AuthError.UserNotFoundFromSocial);
    }

    const { id: socialId } = req.user;

    const socialLoginDoc = await this.authService.getSocialInfo(socialId);

    if (socialLoginDoc) {
      const userInfoBySocialLogin = await this.authService.getUserInfoBySocialId(
        socialLoginDoc._id
      );

      const [accessToken, refreshToken] = await this.authService.handleResponseUserToken(
        userInfoBySocialLogin
      );

      return res.status(HttpStatus.OK).json({
        accessToken,
        refreshToken
      });
    }

    const client = await this.clientService.findClientApp({ clientId, clientSecret });

    const newSocialLoginDTO = new NewSocialLoginDTO({
      socialId: req.user.id,
      userSocialResponse: req.user,
      socialType: SocialTypeEnum.Google
    });

    const socialLogin = await this.authService.createNewSocialLogin(newSocialLoginDTO);

    const createUserDTO = new RegisterDTO().fromUserSocial({
      ...req.user,
      clientSecret: client.clientSecret,
      clientId: client.clientId,
      socialObjectId: socialLoginDoc._id
    });

    const user = await this.authService.registerUser(createUserDTO);

    const [accessToken, refreshToken] = await this.authService.handleResponseUserToken(user);

    return res.status(HttpStatus.OK).json({
      accessToken,
      refreshToken
    });
  }
}
