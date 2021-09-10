import { RegisterDTO } from '@auth/dto/register.dto';
import { AuthService } from '@auth/services/auth.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseInterceptors
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as swagger from '@nestjs/swagger';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import express from 'express';
import { Model } from 'mongoose';
import { UserModel } from './schema/user.schema';

@Controller('auth')
@swagger.ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectModel(UserModel.name) public userModel: Model<UserModel>
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  @ApiOperation({ summary: 'User register' })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client Not found'
  })
  @ApiUnprocessableEntityResponse({
    status: HttpStatus.NOT_MODIFIED,
    description: 'Failed created'
  })
  @ApiCreatedResponse({
    description: 'Successful created user',
    status: HttpStatus.CREATED
  })
  async register(@Body() registerDto: RegisterDTO, @Res() res: express.Response) {
    const newUser = await this.authService.registerUser(registerDto);

    return res.status(HttpStatus.CREATED).json(new this.userModel(newUser));
  }
}
