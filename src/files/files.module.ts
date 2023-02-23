import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './files.entity';
import { UsersModule } from 'src/users/users.module';
import { FoldersModule } from 'src/folders/folders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    UsersModule,
    forwardRef(() => FoldersModule)
  ],
    exports: [TypeOrmModule],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}
