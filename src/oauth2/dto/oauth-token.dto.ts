import { ApiProperty } from '@nestjs/swagger';
import { GrantsEnum } from '@oauth2/schema/client-v2.schema';
import { IsEmail, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class OAuth2TokenDTO {
  @ApiProperty({
    enum: GrantsEnum,
    nullable: false
  })
  @IsEnum(GrantsEnum)
  grant_type: GrantsEnum;

  @ApiProperty({
    name: 'username',
    required: false,
    example: 'test_user_v4@gmail.com'
  })
  @ValidateIf((o) => o.grant_type === GrantsEnum.password)
  @IsEmail()
  username: string;

  @ApiProperty({
    name: 'password',
    required: false,
    example: '123qwe123qwe@'
  })
  @ValidateIf((o) => o.grant_type === GrantsEnum.password)
  @IsString()
  password: string;

  @ApiProperty({
    name: 'refresh_token',
    required: false
  })
  @ValidateIf((o) => o.grant_type === GrantsEnum.refresh_token)
  @IsString()
  refresh_token: string;

  @ApiProperty({
    name: 'client_id',
    description: 'Client app id',
    required: true,
    example: 'LtV6q9FBRWiJvzuFfndNETZKYgRFol5Z9KvKKJrgzUY='
  })
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({
    name: 'client_secret',
    description: 'Client app secret',
    required: true,
    example: 'd6ad1ed069a2ed7b57cdd6d9f42426df82ccb455eef8e538f3205dabc2a2a1f4'
  })
  @IsString()
  @IsNotEmpty()
  client_secret: string;
}
