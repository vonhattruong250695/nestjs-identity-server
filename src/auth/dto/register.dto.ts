import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IGoogleStrategyResponse } from '@auth/interfaces/google-auth-response.interface';
import { Exclude } from 'class-transformer';
import { IFacebookAuthResponse } from '@auth/interfaces/facebook-auth-response.interface';

const example = {
  email: 'vonhattruong250695@gmail.com',
  password: '123qwe123qwe@',
  name: 'Vo Nhat Truong'
};

export interface IFromGoogleUserResponse extends IGoogleStrategyResponse {
  clientId: string;
  clientSecret: string;
  socialObjectId: string;
}

export interface IFromFacebookUserResponse extends IFacebookAuthResponse {
  clientId: string;
  clientSecret: string;
  socialObjectId: string;
}

export class RegisterDTO {
  @ApiProperty({
    example: example.email
  })
  @IsEmail()
  @IsString()
  readonly userEmail: string;

  @IsString()
  @IsOptional()
  readonly firstName: string;

  @IsString()
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({
    example: example.password
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty({
    type: String,
    nullable: false
  })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiProperty({
    type: String,
    nullable: false
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @Exclude()
  @IsOptional()
  socialLogin: string;

  fromGoogleUser?(userSocialResponse: IFromGoogleUserResponse): RegisterDTO {
    return {
      clientId: userSocialResponse.clientId,
      clientSecret: userSocialResponse.clientSecret,
      firstName: userSocialResponse.name.givenName,
      lastName: userSocialResponse.name.familyName,
      password: '',
      socialLogin: userSocialResponse.socialObjectId,
      userEmail: userSocialResponse.emails[0].value
    };
  }

  fromFacebookUser?(userSocialResponse: IFromFacebookUserResponse): RegisterDTO {
    return {
      clientId: userSocialResponse.clientId,
      clientSecret: userSocialResponse.clientSecret,
      firstName: userSocialResponse.name.givenName,
      lastName: userSocialResponse.name.familyName,
      password: '',
      socialLogin: userSocialResponse.socialObjectId,
      userEmail: userSocialResponse?.emails ? userSocialResponse?.emails[0]?.value : ''
    };
  }
}
