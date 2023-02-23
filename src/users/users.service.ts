import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';


@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>){}

    create(email: string, password: string, role: 'admin'|'user'){
        const user = this.repo.create({email, password, role});
        return this.repo.save(user);
    }

    async findOne(id: number){
        if (!id){
            return null;
        }
        const user = await this.repo.findOne({where:{id: id}, relations:{locked_files:true, myfiles: true}});
        return user;
        //return this.repo.findOneBy({id: id, reports:true} );
        // this.repo.findOne({email: "moha@123"}) // we can pass search criterai or id
        // in the course he use onlu findOne
    }

    find(email: string){
        return this.repo.findBy({email});
        // in the course he use find
    }


    // PARTIAL :: OBJECT HAVE AT LEAST SOME OF NONE OF PROPERTIES OF SOME TYPE
    // update(id: number,email, password ,age ) we DON'T WANNA THAT
    async update(id: number, attrs: Partial<User>){
        // WE WILL USE HOOKS
        // WE WILL NOT USE INSERT, UPDATE
        // WE WILL USE SAVE & REMOVE TO EXCUTE HOOKS
        // BUT WE FIRST NEED THE USER ENTITY INSTANCE SO WE HAVE TO FETCH DATABASE FIRST SO IT IS A LITTLE BAD PERFORAMANCE


        // we shouldn't throw error 
        // we have to throw errors defined by nestjs so that nestjs can extract infromations
        // also we should not throw these exception in the service because we may have non http controller
        const user = await this.findOne(id);
        if (!user){
            throw new NotFoundException('user not found');
        }
        Object.assign(user, attrs);
        return this.repo.save(user);
    }

    async remove(id: number){
        // ALSO WE WILL USE REMOVE FOR HOOKS
        // REMOVE (ENTITY)
        // DELETE (ID)
        const user = await this.findOne(id);
        if (!user){
            throw new NotFoundException('user not found');
        }
        return this.repo.remove(user);
    }

    file(file: Express.Multer.File){
        console.log(file);
    }
}


