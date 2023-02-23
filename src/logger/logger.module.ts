import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './logger.entity';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Log])],
    providers: [LoggerService],
    controllers: [LoggerController],
    exports: [LoggerService]
})
export class LoggerModule {}
