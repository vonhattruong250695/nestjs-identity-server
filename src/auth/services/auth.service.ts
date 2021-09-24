import { UserRegister } from '@auth/interfaces/user-register.interface';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(UserModel.name) public userModel: Model<UserModel>,
    @InjectModel(SocialLoginModel.name) public socialLoginModel: Model<SocialLoginModel>,
    private readonly jwtService: JwtService,
    private clientServiceV2: ClientService
  ) {}

  async registerUser(createUserDto: RegisterDTO): Promise<LeanDocument<UserRegister>> {
    const clientAppOfUser = await this.clientServiceV2.findClientApp({
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
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME
    });
  }

  async generateRefreshToken(
    user: LeanDocument<UserModel>,
    socialType?: SocialTypeEnum
  ): Promise<string> {
    const payload = { socialType, userId: user._id };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME
    });
  }

  async updateUserHashRefreshToken(userId: string, refreshToken: string) {
    await this.userModel.findOneAndUpdate({ _id: userId }, { refreshToken });
  }

  async createNewSocialLogin(
    newSocialLoginDTO: NewSocialLoginDTO
  ): Promise<LeanDocument<SocialLoginModel>> {
    const socialLoginDoc = new this.socialLoginModel(newSocialLoginDTO);

    await socialLoginDoc.save();

    return socialLoginDoc.toJSON();
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return bcrypt.hash(refreshToken, process.env.JWT_SALT_LENGTH);
  }

  async handleResponseUserToken(
    user: LeanDocument<UserModel>
  ): Promise<[accessToken: string, refreshToken: string]> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user)
    ]);

    const hashRefreshToken = await this.hashRefreshToken(refreshToken);

    await this.updateUserHashRefreshToken(user._id, hashRefreshToken);

    return [accessToken, refreshToken];
  }
}
