import { Exclude, Expose, Transform } from 'class-transformer';
import { User } from '../../users/users.entity'

export class FileDto {
  @Expose()
  filename: string;
  
  @Expose()
  path: string;

  @Expose() 
  is_locked: boolean;

  @Expose()
  locker: User;

  @Exclude()
  owner: User;

  @Transform(({ obj }) => obj.owner.id) //take the original report object and return some property
  @Expose()
  ownerId: number;

  
}
