import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common'

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

//import { UserDto } from 'src/users/dtos/user.dto';


interface ClassConstructor{
    new (...args: []): {}
}
// decorator to simlify work
//export function Serialize(dto: any){
 export function Serialize(dto: ClassConstructor){
    return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor{
    // Here I implement interface to make easy call this class
    // we mustimplement all methods in the interface

    constructor(private dto: any){}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        // Run something before request is handled
        // by the request handler
        //console.log('I am run before the request handler,' + context);


        // run code after run the request handler
        return next.handle().pipe(
            map((data: any) => { // data is the data sent by response
                //Run something befoe the response sent out 
                // console.log('I am running before response sent out' +  data);
               // return plainToClass(UserDto, data, { // also we need that interceptor is not #hard#coded to use #user_dto 
                 return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true // exclude properties not included in the dto
                })
            })
        )
    }

}
