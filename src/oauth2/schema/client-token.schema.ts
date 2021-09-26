import { UserModel } from '@auth/schema/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { ClientModel } from '@oauth2/schema/client.schema';
import OAuth2Server from 'oauth2-server';

@Schema({ timestamps: true, collection: 'clientTokens' })
export class ClientTokenModel extends Document {
  @Prop({ type: String, required: false })
  clientId: string;

  @Prop({ type: String, required: false })
  id: string;

  @Prop({ type: String, required: true })
  accessToken: string;

  @Prop({ type: Date, required: false })
  accessTokenExpiresAt: Date;

  @Prop({ type: String, required: true })
  refreshToken: string;

  @Prop({ type: Date, required: false })
  refreshTokenExpiresAt: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: ClientModel.name })
  client: OAuth2Server.Client;

  @Prop({ type: SchemaTypes.ObjectId, ref: UserModel.name })
  user: OAuth2Server.User;
}

export const ClientTokenSchema = SchemaFactory.createForClass(ClientTokenModel);
