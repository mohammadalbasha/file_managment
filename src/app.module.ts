import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { User } from './users/users.entity';
import { File } from './files/files.entity';
import { Folder } from './folders/folders.entity';
import { FoldersModule } from './folders/folders.module';
import { Report } from './files/reports.entity';
import { Log } from './logger/logger.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppLoggerMiddleware } from './middlewares/log.middleware';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'

const ormConfig = require('../ormConfig.js')
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
  // debug: false,
  // playground: false
}),
// GraphQLModule.forRootAsync<ApolloDriverConfig>({
//   driver: ApolloDriver,
//   imports: [ConfigModule],
//   useFactory: async (configService: ConfigService) => ({
//     typePaths: configService.get<string>('GRAPHQL_TYPE_PATHS'),
//   }),
//   inject: [ConfigService],
// }),
// GraphQLModule.forRootAsync<ApolloDriverConfig>({
//   driver: ApolloDriver,
//   useClass: GqlConfigService,
// })
// GraphQLModule.forRootAsync<ApolloDriverConfig>({
//   driver: ApolloDriver,
//   useFactory: () => ({
//     typePaths: ['./**/*.graphql'],
//   }),
// }),


  //   TypeOrmModule.forRoot({
  //   type: 'sqlite',
  //   database: 'db.sqlite', // unique database, this will make nestjs create a db.sqlite databse file for us
  //   entities: [User, File, Folder, Report],
  //   synchronize: true
  // }),
  TypeOrmModule.forRoot(ormConfig),
  //TypeOrmModule.forRoot(ormConfig),
   UsersModule,
    FilesModule,
      FoldersModule, 
    LoggerModule, HealthModule],
  controllers: [AppController],
  providers: [AppService,
     {
        provide: APP_INTERCEPTOR,
        useClass: LoggerInterceptor
      }
    ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer){
  //   consumer
  //     .apply(AppLoggerMiddleware)
  //     .forRoutes("*")
  // }
}
