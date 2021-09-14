import { UserModel } from '@auth/schema/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';
import { ClientModel } from '@oauth2/schema/client.schema';

@Schema({ timestamps: true })
export class ClientTokenModel extends Document {
  @Prop({ type: String, required: true, unique: true })
  clientId: string;

  @Prop({ type: String, required: true })
  accessToken: string;

  @Prop({ type: Date, required: false })
  accessTokenExpiresAt: Date;

  @Prop({ type: String, required: true })
  refreshToken: string;

  @Prop({ type: Date, required: false })
  refreshTokenExpiresAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: ClientModel.name })
  client: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: UserModel.name })
  user: Types.ObjectId;
}

export const ClientTokenSchema = SchemaFactory.createForClass(ClientTokenModel);
