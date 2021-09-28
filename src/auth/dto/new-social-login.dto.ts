import { SocialTypeEnum } from '@auth/schema/social-login.schema';
import { IGoogleStrategyResponse } from '@auth/interfaces/google-auth-response.interface';

export interface INewSocialLoginConstructor {
  userSocialResponse: IGoogleStrategyResponse;
  socialType: SocialTypeEnum;
  socialId: string;
}

export class NewSocialLoginDTO {
  type: SocialTypeEnum;
  picture: string;
  firstName: string;
  lastName: string;
  photo: string;
  socialId: string;

  constructor(userSocialResponse: INewSocialLoginConstructor) {
    this.type = userSocialResponse.socialType;
    this.firstName = userSocialResponse.userSocialResponse.name.givenName;
    this.lastName = userSocialResponse.userSocialResponse.name.familyName;
    this.photo = userSocialResponse.userSocialResponse.photos[0].value;
    this.picture = userSocialResponse.userSocialResponse.photos[0].value;
    this.socialId = userSocialResponse.socialId;
  }
}
