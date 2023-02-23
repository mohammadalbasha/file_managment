import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from '../users.entity';
import { UsersService } from '../users.service';
const jwt = require('jsonwebtoken');

declare global {
  namespace Express {
    interface Request {
      currentUser?: User
    }
  }
}


@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.get('Authorization');
    if (!authHeader){
      throw new ForbiddenException("not Authenticated");
    }

    const token = authHeader.split(' ')[1];

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'secretkey');
    }
    catch (err) {
      throw new ForbiddenException("not Authenticated");
    }
    if (!decodedToken){
      throw new ForbiddenException("not Authenticated");
    }

    const { userId } = decodedToken;
    const user = await this.usersService.findOne(userId);
    if (!user){
      throw new ForbiddenException("not Authenticated");
    }
    req.currentUser = user;

next();
} 
  }

