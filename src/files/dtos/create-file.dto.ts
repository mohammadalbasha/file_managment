import {
    IsString,
    IsBoolean,
} from 'class-validator'

export class CreateFileDto {

    @IsString()
    filename: string;

    @IsString()
    path: string;

  

}