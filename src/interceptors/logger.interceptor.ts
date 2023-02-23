import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Injectable,
    Scope,
    BadRequestException
} from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common';

import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Log } from 'src/logger/logger.entity';
import { DataSource } from 'typeorm';

require("dotenv").config();

//import { UserDto } from 'src/users/dtos/user.dto';

export const transactionDecorator = createParamDecorator(
    (data: never, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        return request.queryRunner;
    }
)

interface ClassConstructor{
    new (...args: []): {}
}
// decorator to simlify work
//export function Serialize(dto: any){
// export function Log(){
  //  return UseInterceptors(new LoggerInterceptor())
//}


@Injectable({scope: Scope.REQUEST})
export class LoggerInterceptor implements NestInterceptor{
    // Here I implement interface to make easy call this class
    // we mustimplement all methods in the interface

    constructor(private dataSource: DataSource){}

    async intercept(context: ExecutionContext, next: CallHandler<any>) {
        console.log("kaka")

        // Run something before request is handled
        // by the request handler
        //console.log('I am from the logger interceptor run before the request handler,' + context);
        const request = context.switchToHttp().getRequest();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        request.queryRunner = queryRunner;

        const { ip, method, originalUrl: url } = request;
        const userAgent = request.get('user-agent') || '';
        const init_time = Date.now();
        //this.logger.log('I am from logger before the request', + request);
        //console.log(request.originalUrl)
        const requestMsg = (`
        ${ip} ${method} ${url}
        `)

        // run code after run the request handler
        return next.handle().pipe(
            map(async (data: any) => { // data is the data sent by response


                const response =  context.switchToHttp().getResponse();
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

                const logConfiguration = process.env.LOG;
        const temp_log = {request:"", response:""};
        switch(logConfiguration){
            case 'QS':
                temp_log.request = requestMsg;
                temp_log.response = reponseMsg;
                break;
            case 'Q':
                temp_log.request = requestMsg;
                break;
            case 'S':
                temp_log.response = reponseMsg;
                break;
        }
                await queryRunner.manager.insert(Log, temp_log);

                    //throw new Error();
                //Run something befoe the response sent out 
                 //console.log('I am from the logger running before response sent out' +  data);
                 await queryRunner.commitTransaction();
                 await queryRunner.release();

                 return data;
               // return plainToClass(UserDto, data, { // also we need that interceptor is not #hard#coded to use #user_dto 
                //  return plainToClass(this.dto, data, {
                //     excludeExtraneousValues: true // exclude properties not included in the dto
                // })
            }),
            catchError (async error => {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();

                throw new BadRequestException();
                //throw error;
            })
        )
    }

}
