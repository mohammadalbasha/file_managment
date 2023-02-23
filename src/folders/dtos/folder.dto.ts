import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from '../../users/users.entity'

export class FolderDto {
  @Expose()
  foldername: string;
  
  @Expose()
  path: string;

  @Exclude()
  owner: User;

  @Transform(({ obj }) => obj.owner.id) //take the original report object and return some property
  @Expose()
  ownerId: number;

  @Exclude()
  files: File[]

  @Transform(({ obj }) => obj.files)
  files_ids: number[]

  
}
