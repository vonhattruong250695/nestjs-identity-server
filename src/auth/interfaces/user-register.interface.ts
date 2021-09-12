import { ClientModel } from '@oauth2/schema/client.schema';
import { LeanDocument } from 'mongoose';
import { UserModel } from './../schema/user.schema';

export class UserRegister extends UserModel {
  clientInfo: LeanDocument<ClientModel>;
}
