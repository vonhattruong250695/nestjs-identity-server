import { UserModel } from '@auth/schema/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { ClientModelV2 } from '@oauth2/schema/client-v2.schema';

@Schema({ timestamps: true })
export class ClientTokenModel {
  @Prop({ type: String, required: true, unique: true })
  clientId: string;

  @Prop({ type: String, required: true })
  accessToken: string;

  @Prop({ type: Date, required: true })
  accessTokenExpiresAt: Date;

  @Prop({ type: String, required: true })
  refreshToken: string;

  @Prop({ type: Date, required: true })
  refreshTokenExpiresAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: ClientModelV2.name })
  client: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: UserModel.name })
  user: Types.ObjectId;
}

export const ClientTokenSchema = SchemaFactory.createForClass(ClientTokenModel);
