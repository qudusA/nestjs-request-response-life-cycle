import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RequestService } from '../request.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly requestService: RequestService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;

    this.logger.log(
      `Request:${method} ${url} ${userAgent} ${ip}: ${context.getClass().name} 
      ${context.getHandler().name} invoked...`,
    );
    this.logger.debug('userId:', this.requestService.getUserId());

    const now = Date.now();
    return next.handle().pipe(
      map((res) => {
        const response = context.switchToHttp().getResponse();

        const { statusCode } = response;
        const contentLength = response.get('content-length');
        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}: ${
            Date.now() - now
          }ms`,
        );
        this.logger.debug('Original Response:', res);

        // Add custom data
        const modifiedResponse = {
          ...res,
          requestTime: new Date().toISOString(),
          userId: this.requestService.getUserId(),
          // metadata: {
          // requestTime: new Date().toISOString(),
          // userId: this.requestService.getUserId(),
          // },
        };

        return modifiedResponse;
      }),
      catchError((err) => {
        this.logger.error(err);
        return throwError(() => err);
      }),
    );
  }
}
