import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from 'src/folders/folders.entity';
import { FoldersService } from 'src/folders/folders.service';
const fs = require("fs");
import { User } from 'src/users/users.entity';
import { In, Repository, DataSource } from 'typeorm';
import { CreateFileDto } from './dtos/create-file.dto';
import { File } from './files.entity';
import { Report } from './reports.entity';
const { getOrSetCache, clearCache } = require("../caching/redis"); 

@Injectable()
export class FilesService {

    constructor(@InjectRepository(File) private repo: Repository<File>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private dataSource: DataSource,
        private foldersService: FoldersService
    ) { }

    // Transactions with transactionEntityManager

    // async create (file: Express.Multer.File, user: User){
    //     return this.dataSource.transaction(async (transactionalEntityManager) => {
    //         console.log(new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) )
    //         // execute queries using transactionalEntityManager
    //         const file_doc = this.repo.create();
    //         file_doc.path = file.path;
    //         file_doc.filename = file.filename;
    //         file_doc.originalname = file.originalname;
    //         file_doc.owner = user;
    //         file_doc.locker = undefined;
    //        await transactionalEntityManager.save(file_doc);
    //        await transactionalEntityManager.createQueryBuilder()
    //         .insert()
    //         .into(Report)
    //         .values({
    //             user_id: user.id,
    //             file_id: file_doc.id,
    //             date:  new Date(),
    //             operation: "create"
    //         })
    //         .execute()

    //     })
    // }



    /* IMPORTNATT! */
    // we must use queryBuilder.manager to excute query to ensure atomicity

    // * transaaaaaaaaaaaaaaaaaaaaavTIOOOOOOOOOOON EDIT*/
//    async create( file: Express.Multer.File, user: User) { // we use the same dto   
    async create(queryRunner, file: Express.Multer.File, user: User) { // we use the same dto   

        // const queryRunner = this.dataSource.createQueryRunner();
        // await queryRunner.connect();
        // await queryRunner.startTransaction();

        try {
            const file_doc = this.repo.create();
            file_doc.path = file.path;
            file_doc.filename = file.filename;
            file_doc.originalname = file.originalname;
            file_doc.owner = user;
        
            const saved_file = await queryRunner.manager.save(file_doc);

            // await this.addReport(file_doc.id, undefined, user.id, "create");
            await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(Report)
                .values({
                    userId: user.id,
                    fileId: file_doc.id,
                    date: new Date(),
                    operation: "create"
                })
                .execute()
  //          await queryRunner.commitTransaction();

            await clearCache(`files/${user.id}`);
            return saved_file;
        }


        catch (err) {
            console.log(err)
    //        await queryRunner.rollbackTransaction();
    //if (!file)
            //throw new BadRequestException("file not found")
            fs.unlink(file.path, () => { });
            throw err;
        }

        // finally {
        //     await queryRunner.release();
        // }
    }





    async update(file: Express.Multer.File, user: User, file_id: number, folder_id: number) {
        const file_doc = await this.findOneById(file_id);
        if (!file || !file.path)
            throw new BadRequestException("file must be uploaded");
        if (!file_doc)
            throw new NotFoundException("file not found");

        const new_file_path = file.path;
        const old_file_path = file_doc.path;

        //    const read_stream = fs.createReadStream(old_file_path);
        //    const write_stream = fs.createWriteStream(new_file_path);
        //    await read_stream.pipe(write_stream);
        //   return file_doc;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();
        try {


            /// SCOPEED SERVICES ****************************** 


            // await this.addReport(file_id, folder_id, user.id, "lock")
            await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(Report)
                .values({
                    userId: user.id,
                    fileId: file_id,
                    folderId: folder_id,
                    date: new Date(),
                    operation: "update"
                })
                .execute()

            file_doc.path = file.path;
            //await this.repo.save(file_doc);
            await queryRunner.manager.save(file_doc);
            await queryRunner.commitTransaction();
            fs.unlink(old_file_path, () => { });

            return file_doc;

        }
        catch (err) {
            await queryRunner.rollbackTransaction();

        }
        finally {
            await queryRunner.release();
        }
    }





    async delete(file_id: number, user: User) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction()
        try {
            const result = await queryRunner.manager.delete(File, { id: file_id, is_locked: false });
            if (result.affected == 0)
                throw new Error();
            await queryRunner.commitTransaction();
            await clearCache(`files/${user.id}`);

            return true;

        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException("file could not be deleted");
        }
    }




    findOneById(file_id: number) {
        return this.repo.findOne({ where: { id: file_id }, relations: { owner: true, locker: true, locking_folder: true } });
    }

    find(user: User){
        return getOrSetCache(`files/${user.id}`, () => {return this.repo.find({where: {ownerId: user.id}, relations: {locker: true} });})
    }

    findAll(){
        return this.repo.find();
    }


    


    async lock(files_ids: number[], user: User, folder_id: number) {

        console.log(files_ids);
        const folder = await this.foldersService.findOne(folder_id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //const result = await this.repo.update({ id: In(files_ids), is_locked: false }, { locker: user, is_locked: true, locking_folder: folder });
            const result = await queryRunner.manager.update(File, { id: In(files_ids), is_locked: false }, { locker: user, is_locked: true, locking_folder: folder })
            if (result.affected != files_ids.length) {
                throw new Error();
            }
            const reportsRepo = this.dataSource.getRepository(Report);
            files_ids.forEach(async (id) => {
                //await this.addReport(id, folder.id, user.id, "lock")
                await queryRunner.manager.createQueryBuilder()
                    .insert()
                    .into(Report)
                    .values({
                        userId: user.id,
                        fileId: id,
                        folderId: folder.id,
                        date: new Date(),
                        operation: "lock"
                    })
                    .execute()

            })

            await queryRunner.commitTransaction();
            return result;
        }
        catch (err) {
            queryRunner.rollbackTransaction();

        }

    }



    async unlock(file_id: number, user: User, folder_id: number) {
       // const folder = await this.foldersService.findOne(folder_id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //const result = await this.repo.update({ id: In(files_ids), is_locked: false }, { locker: user, is_locked: true, locking_folder: folder });
            const result = await queryRunner.manager.update(File, { id: file_id }, { locker: null, is_locked: false, locking_folder: null })
            if (result.affected != 1) {
                throw new Error();
            }
              //await this.addReport(id, folder.id, user.id, "lock")
                await queryRunner.manager.createQueryBuilder()
                    .insert()
                    .into(Report)
                    .values({
                        userId: user.id,
                        fileId: file_id,
                        folderId: folder_id,
                        date: new Date(),
                        operation: "unlock"
                    })
                    .execute()

            await queryRunner.commitTransaction();
            return result;
        }
        catch (err) {
            queryRunner.rollbackTransaction();
        }
    }


    async getReports(file_id: number) {
        const reports = await this.dataSource.getRepository(Report)
            .find({ where: { fileId: file_id }, relations: { user: true, folder: true, file: true } })

        return reports;
    }



    addReport(file_id: number, folder_id: number, user_id: number, operation: string) {
        return this.dataSource.createQueryBuilder()
            .insert()
            .into(Report)
            .values({
                userId: user_id,
                fileId: file_id,
                date: new Date(),
                operation: operation
            })
            .execute()

    }
}
