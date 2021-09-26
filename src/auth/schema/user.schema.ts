import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';
import { SocialLoginModel } from './social-login.schema';
import { ClientModel } from '@oauth2/schema/client.schema';

export async function validateUserPassword(
  password: string,
  hashPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashPassword);
}

@Schema({ timestamps: true, collection: 'users' })
export class UserModel extends Document {
  @Prop({ type: String, required: false })
  password?: string;

  @Prop({ type: String, required: false })
  @Exclude()
  hashRefreshToken: string;

  @Prop({ type: String, unique: true })
  userEmail: string;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String, required: false })
  lastName: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: SocialLoginModel.name })
  socialLogin: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: ClientModel.name })
  client: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
UserSchema.pre<UserModel>('save', async function (next) {
  if (!this.password.trim().length) return next();

  this.password = await bcrypt.hash(this.password, +process.env.JWT_SALT_LENGTH);
  next();
});
