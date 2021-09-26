import { UserRegister } from '@auth/interfaces/user-register.interface';
import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { RegisterDTO } from '../dto/register.dto';
import { UserModel, validateUserPassword } from './../schema/user.schema';
import { ClientService } from '@oauth2/services/client.service';
import { UnauthorizedRequestError } from 'oauth2-server';
import { AuthError } from '@auth/constants/auth.error';
import { JwtService } from '@nestjs/jwt';
import { SocialLoginModel, SocialTypeEnum } from '@auth/schema/social-login.schema';
import { NewSocialLoginDTO } from '@auth/dto/new-social-login.dto';
import * as bcrypt from 'bcrypt';
import { ClientModel } from '@oauth2/schema/client.schema';
import { Oauth2ModelService } from '@oauth2/services/oauth2-model.service';
import OAuth2Server = require('@truongvn/oauth2-server');

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    @InjectModel(SocialLoginModel.name) private socialLoginModel: Model<SocialLoginModel>,
    private readonly jwtService: JwtService,
    private clientService: ClientService,
    @Inject(forwardRef(() => Oauth2ModelService))
    private oauth2ModelService: Oauth2ModelService
  ) {}

  async registerUser(createUserDto: RegisterDTO): Promise<LeanDocument<UserRegister>> {
    const clientAppOfUser = await this.clientService.findClientApp({
      clientId: createUserDto.clientId,
      clientSecret: createUserDto.clientSecret
    });
    const userDoc = new this.userModel({
      ...createUserDto,
      client: clientAppOfUser._id
    });

    await userDoc.save();

    this.logger.log(userDoc);

    return {
      ...userDoc.toJSON(),
      clientInfo: clientAppOfUser
    };
  }

  async getUserInfoByUserNameAndPassword(userName: string, password: string): Promise<UserModel> {
    const userInfo = await this.userModel.findOne({
      userEmail: userName
    });

    if (!userInfo) {
      throw new NotFoundException();
    }

    const isValidPassword = await validateUserPassword(password, userInfo.password);

    if (!isValidPassword) {
      throw new UnauthorizedRequestError(AuthError.UserPasswordIncorrect);
    }

    return userInfo;
  }

  async getUserById(userId: string): Promise<LeanDocument<UserModel>> {
    return this.userModel.findOne({ _id: userId }).lean();
  }

  async getSocialInfo(socialId: string): Promise<LeanDocument<SocialLoginModel>> {
    return this.socialLoginModel
      .findOne({
        socialId
      })
      .lean();
  }

  async getUserInfoBySocialId(socialId: string): Promise<LeanDocument<UserModel>> {
    return this.userModel.findOne({ socialLogin: socialId }).lean();
  }

  async generateAccessToken(
    user: LeanDocument<UserModel>,
    socialType?: SocialTypeEnum
  ): Promise<string> {
    const payload = { socialType, userId: user._id };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}s`
    });
  }

  async generateRefreshToken(
    user: LeanDocument<UserModel>,
    socialType?: SocialTypeEnum
  ): Promise<string> {
    const payload = { socialType, userId: user._id };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}s`
    });
  }

  async createNewSocialLogin(
    newSocialLoginDTO: NewSocialLoginDTO
  ): Promise<LeanDocument<SocialLoginModel>> {
    const socialLoginDoc = new this.socialLoginModel(newSocialLoginDTO);

    await socialLoginDoc.save();

    return socialLoginDoc.toJSON();
  }

  async hashUserToken(token: string): Promise<string> {
    return bcrypt.hash(token, +process.env.JWT_SALT_LENGTH);
  }

  async handleResponseUserToken(
    user: LeanDocument<UserModel>,
    clientApp: LeanDocument<ClientModel>
  ): Promise<OAuth2Server.Token> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user, SocialTypeEnum.Google),
      this.generateRefreshToken(user, SocialTypeEnum.Google)
    ]);

    const token: OAuth2Server.Token = {
      client: clientApp as OAuth2Server.Client,
      user: user as OAuth2Server.User,
      accessToken,
      refreshToken
    };

    clientApp.id = clientApp._id;

    return this.oauth2ModelService.saveToken(
      token,
      clientApp as OAuth2Server.Client,
      user as OAuth2Server.User
    );
  }
}
