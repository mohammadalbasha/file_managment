import {
    CanActivate,
    ExecutionContext
} from '@nestjs/common'
import { Observable } from 'rxjs'

export class IsAdminGuards implements CanActivate {

    // constructor(){} inject some dependencies 
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { currentUser } = request;
    return currentUser.role == 'admin'
} 
}