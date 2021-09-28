import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import express from 'express';

@Injectable()
export class BeforeSocialAuthMiddleware implements NestMiddleware {
  private logger = new Logger(BeforeSocialAuthMiddleware.name);
  use(req: express.Request, res: express.Response, next: () => void) {
    this.logger.log('BeforeSocialAuthMiddleware');

    next();
  }
}
