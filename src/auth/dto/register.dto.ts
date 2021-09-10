import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const example = {
  email: 'vonhattruong250695@gmail.com',
  password: '123qwe123qwe@',
  name: 'Vo Nhat Truong',
};

export class RegisterDTO {
  @ApiProperty({
    example: example.email,
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
    example: example.password,
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;

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
}
