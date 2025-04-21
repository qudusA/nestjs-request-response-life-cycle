import { Injectable, Logger } from '@nestjs/common';
import { RequestService } from './request.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly requestService: RequestService) {}

  // eslint-disable-next-line prettier/prettier
  getHello(): {data: string} {
    this.logger.log('userId:', this.requestService.getUserId());
    // eslint-disable-next-line prettier/prettier
    return {data: 'Hello World!'};
  }
}
