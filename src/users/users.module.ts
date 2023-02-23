import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { AuthenticationMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule, UsersService],
  controllers: [UsersController],
  providers: [
    UsersService,
     AuthService,
    ]
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer){
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: '/auth/signup', method: RequestMethod.POST},
        { path: '/auth/signin', method: RequestMethod.POST},
        { path: '/auth/admin/signup', method: RequestMethod.POST},
        { path: '/auth/admin/signin', method: RequestMethod.POST},
        { path: '/', method: RequestMethod.ALL},
        { path: '/health/http', method: RequestMethod.ALL},
        { path: '/health/database', method: RequestMethod.ALL},
        { path: '/health/disk', method: RequestMethod.ALL},
        { path: '/health/diskNegative', method: RequestMethod.ALL},
        { path: '/graphql', method: RequestMethod.ALL}



        )
      .forRoutes("*")
  }
}
