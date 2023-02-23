import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  
    constructor(private loggerService: LoggerService){}

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get('user-agent') || '';
    const init_time = Date.now();
    //this.logger.log('I am from logger before the request', + request);
    //console.log(request.originalUrl)

    const requestMsg = (`
    ${ip} ${method} ${url}
    `)
    

    response.on('close',async () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

    //   this.logger.log(
    //     `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
    //   );
    
    
    //console.log(response)
      const taken_time = Date.now() - init_time; 
      const reponseMsg = (
        `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}  
        the request took ${taken_time} ms
        `
      );

      if (url == '/files' && method == 'POST')
        return ;

      await this.loggerService.create(requestMsg, reponseMsg);
    
      //this.logger.log("i am from logger before the response set", + response)
    
});

    next();
  }
}