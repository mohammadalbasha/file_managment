import { BadRequestException, Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Serialize } from "src/interceptors/serialize.interceptos";
import { CurrentUser } from "src/users/decorators/current-user.decorator";
import { AuthGuards } from "src/users/guards/auth.guards";
import { IsAdminGuards } from "src/users/guards/is-admin.guard";
import { User } from "src/users/users.entity";
import { FolderDto } from "./dtos/folder.dto";
import { FoldersService } from "./folders.service";
import { FolderAuthorizedGuard } from "./guards/folderAuthorized.guard";
import { FolderOwnerGuard } from "./guards/folderOwner.guard";

@Controller('folders')
export class FoldersController {
    
    constructor(private foldersService: FoldersService) {}

    @Post()
    @UseGuards(AuthGuards)
    @Serialize(FolderDto)
    createFolder(@Body() body, @CurrentUser() current_user){
        const { foldername } = body;
        return this.foldersService.create(foldername, current_user);
    } 

    @Get('/myfolders')
    getMyFolders(@CurrentUser() user: User){
        return this.foldersService.find(user);
    }

    
    @Get('/admin')
    @UseGuards(IsAdminGuards)
    getFolders(){
      return this.foldersService.findAll();
    }


    @Get('/:folder_id')
    @UseGuards(FolderAuthorizedGuard)
    getFiles(@Param('folder_id') folder_id){
        return this.foldersService.findOne(parseInt(folder_id));
    }

    @Post('/add-file')
    @UseGuards(FolderAuthorizedGuard)
    async addFile(@Body() body) {
        const { file_id, folder_id } = body;
        return this.foldersService.addFile(parseInt(folder_id), parseInt(file_id));
    }

    @Post('/add-auth-user')
    @UseGuards(FolderOwnerGuard)
    addAuthUser(@Body() body) {
        return this.foldersService.addAuthorizedUser(parseInt(body.folder_id), parseInt(body.user_id));
    }

    
    @Post('/remove-auth-user')
    @UseGuards(FolderOwnerGuard)
    removeAuthUser(@Body() body) {
        return this.foldersService.removeAuthorizedUser(parseInt(body.folder_id), parseInt(body.user_id));
    }
    
    @Delete()
    @UseGuards(FolderOwnerGuard)
    async deleteFolder(@Body() body){
        const result = await this.foldersService.delete(parseInt(body.folder_id));
        if (result)
            return "folder deleted successfully"
    }
}