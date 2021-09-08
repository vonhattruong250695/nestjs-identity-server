import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Render,
  Res
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import express from 'express';
import { RegisterDTO } from './dto/register.dto';

@Controller('auth')
@ApiTags('oauth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: 'User register' })
  @ApiUnprocessableEntityResponse({
    status: HttpStatus.NOT_MODIFIED,
    description: 'Successful created user',
  })
  @ApiOkResponse({
    description: 'Failed created',
    status: HttpStatus.CREATED,
  })
  async register(
    @Body() registerDto: RegisterDTO,
    @Res() res: express.Response,
  ) {}

  @Get()
  @Render('pages')
  root() {
    
  }
}
