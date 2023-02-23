import { Controller,Post, Put, Body, Get, Param, Patch, Query, Delete, NotFoundException, UseInterceptors, ClassSerializerInterceptor,  Session, Req } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { Serialize } from 'src/interceptors/serialize.interceptos';
import { UserDto } from './dtos/user.dto';
import { CurrentUser } from './decorators/current-user.decorator';


import { User } from './users.entity';
import { AuthGuards } from './guards/auth.guards';
import { UseGuards } from '@nestjs/common';
import { IsAdminGuards } from './guards/is-admin.guard';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
    constructor(private usersService: UsersService, private authService: AuthService){}


    @Get('whoami')
    @UseGuards(AuthGuards)
    whoAmI(@CurrentUser() user: User){
     return user;   
    }


    @Post('/signup')
    createUser(@Body() body: CreateUserDto){
        return this.authService.signup(body.email, body.password, 'user');
    }

    @Post('/admin/signup')
    //@UseGuards(IsAdminGuards)
    createAdmin(@Body() body: CreateUserDto){
        return this.authService.signup(body.email, body.password, 'admin');
    }
    

    @Post('/signin')
    async signin(@Body() body: CreateUserDto) {
        const token = await this.authService.signin(body.email, body.password);
        return JSON.stringify(token);
    }


    //@UseInterceptors(ClassSerializerInterceptor)

    //@UseInterceptors(new SerializeInterceptor(UserDto))
    // we will create decorator ti simplify this code and reduce imports
    
    //@Serialize(UserDto) // we will apply this to the controller
    // @Get('/:id')
    // async findUser(@Param('id') id: string){
    //     const user =  await this.usersService.findOne(parseInt(id));
    //     if (!user){
    //         throw new NotFoundException('user not found');
    //     }
    //     return user;
    // }   


    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    findAllUsers(@Query('email') email: string){
        return this.usersService.find(email);
    }


    @Delete('/:id')
    delete(@Param('id') id: string){
        return this.usersService.remove(parseInt(id));
    }

    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto){
        return this.usersService.update(parseInt(id), body);
    }
}
