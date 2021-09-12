import { RegisterDTO } from '@auth/dto/register.dto';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
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
import { AuthService } from '@auth/services/auth.service';

@Controller('auth')
@swagger.ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectModel(UserModel.name) public userModel: Model<UserModel>
  ) {}

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

    const { password: _, ...user } = newUser;

    return res.status(HttpStatus.CREATED).json(user);
  }
}
