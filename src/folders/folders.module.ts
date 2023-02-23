import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from 'src/files/files.module';
import { UsersModule } from 'src/users/users.module';
import { FoldersController } from './folders.controller';
import { Folder } from './folders.entity';
import { FolderssResolver } from './folders.resolver';
import { FoldersService } from './folders.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Folder]),
        forwardRef(() => FilesModule),
        UsersModule
    ],
    exports: [FoldersService],
    providers: [FoldersService, FolderssResolver],
    controllers: [FoldersController]

})
export class FoldersModule {} ;