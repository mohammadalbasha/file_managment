import { Controller,Post, Get, Body, Res,  UseGuards, UseInterceptors, InternalServerErrorException, Param, NotFoundException, ConflictException, Delete, Query, StreamableFile } from '@nestjs/common';
import { UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response, Request } from 'express';
import { diskStorage } from 'multer';
const fs = require("fs");

import { FilesService } from './files.service'; 
import { AuthGuards } from 'src/users/guards/auth.guards';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { FileOwnerGuard } from './guards/fileOwner';
import { Serialize } from 'src/interceptors/serialize.interceptos';
import { FileDto } from './dtos/file.dto';
import { FolderAuthorizedGuard } from 'src/folders/guards/folderAuthorized.guard';
import { FileLockerGuard } from './guards/fileLocker.guard';
import { FilesAuthorizedGuard } from 'src/folders/guards/filesAuthorized';
import { IsAdminGuards } from 'src/users/guards/is-admin.guard';
import { createReadStream } from 'fs';
import { transactionDecorator } from 'src/interceptors/logger.interceptor';
 
@Controller('files')
export class FilesController {

    constructor(private fileService: FilesService){}


    @Post()
    @UseGuards(AuthGuards)
    @Serialize(FileDto)
    @UseInterceptors(FileInterceptor('file', {
     storage: diskStorage({
       destination: './uploads'
       , filename: (req, file, cb) => {
         const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
         const name = `${randomName}${(file.originalname)}`;
         cb(null, name);
       }
     })
   })) 
   /* TRANSACTIIOOOOOOOOOOOOOOOOOOON EDIT */
    //async createFile(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
      async createFile(@transactionDecorator() queryRunner ,@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {

      
        const new_file = await this.fileService.create(queryRunner, file, user);
        //const new_file = await this.fileService.create(file, user);
    
        if (!new_file){
              throw new InternalServerErrorException("file not uploaded! try again");
          }
       return new_file;
      
      
      
      }
 

    @Post('/update-file')
    @UseGuards(FileLockerGuard)
    @UseInterceptors(FileInterceptor('file', {
     storage: diskStorage({
       destination: './uploads'
       , filename: (req, file, cb) => {
         const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
         const name = `${randomName}${(file.originalname)}`;
         cb(null, name);
       }
     })
   })) 
    async updateFile(@UploadedFile() file: Express.Multer.File, @Body() body, @CurrentUser() user: User, @Query('file_id') file_id) {
     const result = await this.fileService.update(file, user, parseInt(file_id), parseInt(body.folder_id));
      console.log(result)  
      if (!result){
            throw new InternalServerErrorException("file not updated! try again");
        }
     return "file updated successfully";
    }
 
    
    // @Get()
    // @UseGuards(FileLockerGuard)
    // async getFile(@Res() res: Response, @Query('file_id') file_id: string){
    //     const file = await this.fileService.findOneById(parseInt(file_id));
    //     if (!file){
    //         throw new NotFoundException("file not found");
    //     }

    //     const fileStream = fs.createReadStream(file.path);
    //     fileStream.on("data", (data) => {
    //         res.write(data);
    //     })
    //     fileStream.on("end", () => {
    //         res.end();
    //     })
    // }
    
    @Get()
    @UseGuards(FileLockerGuard)
    async getFile(@Res({ passthrough: true }) res: Response,  @Query('file_id') file_id: string): Promise<StreamableFile> {
      const file_doc = await this.fileService.findOneById(parseInt(file_id));
      if (!file_doc){
          throw new NotFoundException("file not found");
      }
      const file = createReadStream(file_doc.path);
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="package.json"',
      });
      return new StreamableFile(file);
    }
  

    @Get('/myfiles')
    getMyFiles(@CurrentUser() user){
      return this.fileService.find(user);
    }

    @Get('/admin')
    @UseGuards(IsAdminGuards)
    getFiles(){
      return this.fileService.findAll();
    }



    @Post('/lock')
    @UseGuards(FilesAuthorizedGuard)
    async lockFiles(@Body() body: {files_ids: number[], folder_id: number}, @CurrentUser() user: User) {
        const files_ids = body.files_ids; 
        const folder_id = body.folder_id;
        const result = await this.fileService.lock(files_ids, user, folder_id);
        if (!result) {
            throw new ConflictException("some files already locked by another user");
        }
        return "files locked successfully"
    }

    @Post('/unlock')
    @UseGuards(FileLockerGuard)
    async unlockFile(@Body() body: {file_id: number, folder_id: number}, @CurrentUser() user: User) {
        const file_id = body.file_id; 
        const folder_id = body.folder_id;
        const result = await this.fileService.unlock(file_id, user, folder_id);
        if (!result) {
            throw new  InternalServerErrorException(" file not unlocked");
        }
        return "files unlocked successfully"
    }

    

    @Delete('/:file_id')
    @UseGuards(FileOwnerGuard)
    async delete(@Param('file_id') file_id, @CurrentUser() user: User){
      const result =  await this.fileService.delete(parseInt(file_id), user);
      if (result)
        return "file deleted successfully"
    }

    @Get('/reports/:file_id')
    getReports(@Param('file_id') file_id){
        return this.fileService.getReports(parseInt(file_id));
    }
}
