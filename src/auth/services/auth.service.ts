import { UserRegister } from '@auth/interfaces/user-register.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { RegisterDTO } from '../dto/register.dto';
import { UserModel } from './../schema/user.schema';
import { ClientService } from '@oauth2/services/client.service';

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
}
