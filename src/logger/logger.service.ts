import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './logger.entity';
require("dotenv").config();

@Injectable()
export class LoggerService {
    constructor (@InjectRepository(Log) private repo: Repository<Log>){}
    create(request: string, response: string){
        const logConfiguration = process.env.LOG;
        const temp_log = {request:"", response:""};
        switch(logConfiguration){
            case 'QS':
                temp_log.request = request;
                temp_log.response = response;
                break;
            case 'Q':
                temp_log.request = request;
                break;
            case 'S':
                temp_log.response = response;
                break;
        }
        const log = this.repo.create(temp_log);
        return this.repo.save(log);
    }
}
