import { SocialTypeEnum } from '@auth/schema/social-login.schema';

export interface IUserJwtInterface {
  userId: string;
  socialType: SocialTypeEnum;
}
