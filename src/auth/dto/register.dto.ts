import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IGoogleStrategyResponse } from '@auth/interfaces/google-strategy-response.interface';
import { Exclude } from 'class-transformer';

const example = {
  email: 'vonhattruong250695@gmail.com',
  password: '123qwe123qwe@',
  name: 'Vo Nhat Truong'
};

export interface IFromUserSocialResponse extends IGoogleStrategyResponse {
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

  fromUserSocial?(userSocialResponse: IFromUserSocialResponse): RegisterDTO {
    return {
      clientId: userSocialResponse.clientId,
      clientSecret: userSocialResponse.clientSecret,
      firstName: userSocialResponse.name.givenName,
      lastName: userSocialResponse.name.familyName,
      password: null,
      socialLogin: userSocialResponse.socialObjectId,
      userEmail: userSocialResponse.emails[0].value
    };
  }
}
