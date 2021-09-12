import { ClientModelV2 } from '@oauth2/schema/client-v2.schema';
import { LeanDocument } from 'mongoose';
import { UserModel } from './../schema/user.schema';

export class UserRegister extends UserModel {
  clientInfo: LeanDocument<ClientModelV2>;
}
