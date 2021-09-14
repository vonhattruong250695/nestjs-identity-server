import { Types } from 'mongoose';

export interface NewClientTokenDTO {
  clientId: string;
  accessToken: string;
  accessTokenExpiresAt?: Date;
  refreshToken: string;
  refreshTokenExpiresAt?: Date;
  client: Types.ObjectId;
  user: Types.ObjectId;
}
