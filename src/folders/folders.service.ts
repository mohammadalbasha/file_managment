import { ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Not, Repository } from "typeorm";
import { Folder } from "./folders.entity";
import { File } from "../files/files.entity";
import { User } from "src/users/users.entity";
import { UsersService } from "src/users/users.service";
const { getOrSetCache, clearCache } = require("../caching/redis"); 

export class FoldersService {

    constructor(@InjectRepository(Folder) private repo: Repository<Folder>,
        @InjectRepository(File) private fileRepo: Repository<File>,
        private usersService: UsersService,
        private dataSource: DataSource
        ) { }



    async create(foldername: string, owner: User) {
        const folder = this.repo.create();
        //const folder = new Folder();
        folder.foldername = foldername;
        folder.owner = owner;
        folder.ownerId = owner.id;
        folder.files = [];
        folder.authorized_users = [owner];
        if (owner.id == 1){
            folder.type = 'public';
        }
        await clearCache(`folders/${owner.id}`);
        return this.repo.save(folder);
    }
    
    async findOne(id: number) {
        if (!id) {
            throw new NotFoundException("folder not found");
        }
        const folder = await this.repo.findOne({ where: { id: id }, relations: { authorized_users: true, files: true, owner: true, locked_files: true } });
        if (!folder) {
            throw new NotFoundException("folder not found");
        }
        return folder;
    }

    find(user: User){
       // return this.repo.find({where:{owner_id: user.id}});
        return getOrSetCache(`folders/${user.id}`, () => {return this.dataSource.query(`
        select * from folder f  inner join folder_authorized_users_user fa on f.id = fa.folderId 
        where fa.userId=${user.id} or f.type='public';
        `);})
    }
    
    findAll(){
        return this.repo.find();
    }

    async updateName(folder_id: number, foldername: string){
        const folder = await this.repo.findOne({where:{id: folder_id}});
        folder.foldername = foldername;
        await this.repo.save(folder);
        return folder;
    }

    async delete (folder_id: number){
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction("REPEATABLE READ");
        try {
            //const folder = await this.findOne(folder_id);
            const folder = await this.dataSource.manager.findOne(Folder, {where: {id: folder_id}, relations: { authorized_users: true, files: true, owner: true, locked_files: true } });
            if (folder.locked_files.length > 0)
                throw new Error();
                const owner_id = folder.ownerId;

            await queryRunner.manager.delete(Folder, {id: folder_id})
            await queryRunner.commitTransaction();
            await clearCache(`folders/${owner_id}`)
            return true;

        }
        catch(err){
            await queryRunner.rollbackTransaction();
            throw new ConflictException("folder has some locked files");
        }
        finally{
            queryRunner.release();
        }
    }

    async addFile(folder_id: number, file_id: number) {
        const folder = await this.repo.findOne({ where: { id: folder_id }, relations: { files: true, owner: true } });
        if (!folder) {
            throw new NotFoundException("folder not found");
        }
        const file = await this.fileRepo.findOne({ where: { id: file_id } });
        if (!file) {
            throw new NotFoundException("file not found");
        }

        folder.files.push(file);
        return this.repo.save(folder);

    }

    async addAuthorizedUser(folder_id: number, user_id: number) {
        // const user = await this.usersService.findOne(user_id);
        // if (!user){ 
        //     throw new NotFoundException("user not found");
        // }
        // const folder = await this.repo.findOne({where: {id: folder_id}, relations: {authorized_users: true}});
        // if (!folder){
        //     throw new NotFoundException("folder not found");
        // }
        // folder.authorized_users.push(user);
        //return this.repo.save(folder);

        const [folder, user] = await Promise.all([this.repo.findOne({ where: { id: folder_id }, relations: { authorized_users: true } }), this.usersService.findOne(user_id)]);
        if (!folder) {
            throw new NotFoundException("folder not found");
        }
        if (!user) {
            throw new NotFoundException("user not found")
        }
        folder.authorized_users.push(user);
        clearCache(`folders/${user.id}`)
        return this.repo.save(folder);

    }

    async removeAuthorizedUser(folder_id: number, user_id: number){
        const [folder, user] = await Promise.all([this.repo.findOne({ where: { id: folder_id }, relations: { authorized_users: true } }), this.usersService.findOne(user_id)]);
        if (!folder) {
            throw new NotFoundException("folder not found");
        }
           
        if (!user) {
            throw new NotFoundException("user not found")
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction("REPEATABLE READ");
        try {
            //const folder = await this.findOne(folder_id);
            const files = await this.dataSource.manager.find(File, {where: {lockerId: user_id, lockingFolderId: folder_id}});
            if (files.length > 0 )
                throw new Error();
            await queryRunner.manager.delete(Folder, {id: folder_id})
            folder.authorized_users = await folder.authorized_users.filter(user => user.id != user_id);

            await queryRunner.manager.save(Folder,folder);
            await queryRunner.commitTransaction();
            return true;
        }
        catch(err){
            await queryRunner.rollbackTransaction();
            throw new ConflictException("folder has some locked files");
        }
        finally{
            queryRunner.release();
        }
   
   
    
        }
    
}

