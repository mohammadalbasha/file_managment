import {
    createParamDecorator,
    ExecutionContext
} from '@nestjs/common'

export const CurrentUser =  createParamDecorator(
    (data: never, context: ExecutionContext) => {
        // data is any data we provide to the decorator
        // never because we don't need any data

        // context is a wrapper of the  incoming request
        // Execution context can abstract web sockets, http request, incoming messages, grpc requests ....
        const request = context.switchToHttp().getRequest();

     //   console.log(request.session.userId);

        // *********************************!!!!!
        // BUT WE Need UserService to get the user with this id
        // But we cant access the DI system with PARAM DECORATOR
        // we Can't register PARAM DECORATOR with DI
        return request.currentUser;

        // so we will create interceptor for that
        // look at diagrams





        // whatever we return here is to be as the user argument in (@CurrentUser user: User)
        return 'hi there'

    }
)