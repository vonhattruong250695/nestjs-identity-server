import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { Oauth2Service } from 'src/oauth2/services/oauth2.service';
import { AuthError } from '../constants/auth.error';
import { RegisterDTO } from '../dto/register.dto';
import { UserModel } from './../schema/user.schema';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(UserModel.name) public userModel: Model<UserModel>,
    private oauth2Service: Oauth2Service
  ) {}

  async registerUser(createUserDto: RegisterDTO): Promise<LeanDocument<UserModel>> {
    const clientAppOfUser = await this.oauth2Service.findClientApp({
      clientId: createUserDto.clientId,
      clientSecret: createUserDto.clientSecret
    });

    const isExistUser = await this.userModel.findOne({
      userEmail: createUserDto.userEmail
    });

    if (isExistUser) {
      throw new HttpException(AuthError.UserExisted, HttpStatus.FOUND);
    }

    const userDoc = new this.userModel({
      ...createUserDto,
      client: clientAppOfUser._id
    });

    await userDoc.save();
    this.logger.log(userDoc);

    return userDoc.toJSON();
  }
}
