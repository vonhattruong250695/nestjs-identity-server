import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';

@Catch()
export class AllExceptionFilter<T> implements ExceptionFilter {
  private logger = new Logger(AllExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`exception => ${JSON.stringify(exception, null, 2)}`);
    this.logger.error(new Error().stack);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      message: exception?.response?.message || exception?.message || 'Internal server error'
    };

    response.status(status).json(errorResponse);
  }
}
