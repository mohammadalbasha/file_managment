import {
    CanActivate,
    ExecutionContext
} from '@nestjs/common'
import { Observable } from 'rxjs'

export class AuthGuards implements CanActivate {

    // constructor(){} inject some dependencies 
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    //const { currentUser } = request;
    //console.log(currentUser);
    // I can do some Authorization here
    return true;
} 
}