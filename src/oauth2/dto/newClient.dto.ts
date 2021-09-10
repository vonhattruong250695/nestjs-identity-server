import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GrantsEnum } from '../schema/client.schema';

export class NewClientDTO {
  @ApiProperty({
    type: String,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiProperty({
    type: String,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiProperty({
    type: [String],
    isArray: true,
    enum: [
      GrantsEnum.client_credentials,
      GrantsEnum.password,
      GrantsEnum.refresh_token,
    ],
  })
  @IsOptional()
  @IsEnum(GrantsEnum, { each: true })
  grants: Array<GrantsEnum>;

  @ApiProperty({
    type: [String],
    nullable: true,
  })
  @IsString({ each: true })
  redirectUris: Array<string>;
}
