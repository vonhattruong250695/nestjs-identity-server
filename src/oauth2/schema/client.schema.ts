import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as CryptoJS from 'crypto-js';
import { Document } from 'mongoose';
import OAuth2Server from 'oauth2-server';

export enum GrantsEnum {
  password = 'password',
  refresh_token = 'refresh_token',
  client_credentials = 'client_credentials'
}

export function combineClientDataToTokenV2(clientId: string, clientSecret: string) {
  return Buffer.from(clientId + ':' + clientSecret).toString('base64');
}

export function hashClientId(clientId: string): string {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(clientId, process.env.OAUTH2_PRIVATE_KEY)
  );
}

export function hashClientSecret(clientSecret: string): string {
  return CryptoJS.enc.Hex.stringify(
    CryptoJS.HmacSHA256(clientSecret, process.env.OAUTH2_PRIVATE_KEY)
  );
}

export function toOAuth2ServerClient(clientModel: ClientModel): OAuth2Server.Client {
  return {
    id: clientModel._id,
    grants: clientModel.grants,
    redirectUris: clientModel.redirectUris,
    ...clientModel
  };
}

@Schema({ timestamps: true })
export class ClientModel extends Document {
  @Prop({ type: String, required: true, unique: true })
  clientId: string;

  @Prop({ type: String, required: true })
  clientSecret: string;

  @Prop({ type: [String], default: [] })
  grants: Array<GrantsEnum>;

  @Prop({ type: [String], default: [] })
  redirectUris: [string];


}

export const ClientSchema = SchemaFactory.createForClass(ClientModel);

ClientSchema.pre<ClientModel>('save', async function (next) {
  this.clientId = hashClientId(this.clientId);
  this.clientSecret = hashClientSecret(this.clientSecret);
  next();
});
