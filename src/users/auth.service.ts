import { Injectable } from '@nestjs/common'
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
import { UsersService } from './users.service'
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const jwt = require ('jsonwebtoken');

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private userService: UsersService){}

    async signup(email: string, password: string, role: 'admin'|'user') {
        
        const users = await this.userService.find(email);
        if (users.length){
            throw new BadRequestException("email in use");
        }
        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(salt, password, 32)) as Buffer; // to maske typescript know what scrypt return 
        const result = salt + '.' + hash.toString('hex');
        const user = await this.userService.create(email, result, role);

        return user;
    }

    async signin(email: string, password: string) {
        const [user] = await this.userService.find(email);
        if (!user) {
            throw new NotFoundException('user not found');
        }
        const [salt, storedHash] = user.password.split('.');
        const hash = (await scrypt(salt, password, 32)) as Buffer;
        
        if (storedHash != hash.toString('hex')) 
            throw new BadRequestException('Bad password');        
            const token =jwt.sign({
                user,
                userId : user.id
            },
            'secretkey',
            {expiresIn:'1h'}
        );
        return {
            token,
            user
        }
    }

}

