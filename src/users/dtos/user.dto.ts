import { Expose } from "class-transformer";
// Expose is opposite of Exclude

export class UserDto{
    
    @Expose()
    id: Number;

    @Expose()
    email: String;

    

}