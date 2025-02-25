import { UserRegister } from '@auth/interfaces/user-register.interface';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { RegisterDTO } from '../dto/register.dto';
import { UserModel, validateUserPassword } from './../schema/user.schema';
import { ClientService } from '@oauth2/services/client.service';
import { UnauthorizedRequestError } from 'oauth2-server';
import { AuthError } from '@auth/constants/auth.error';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(UserModel.name) public userModel: Model<UserModel>,
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
}
