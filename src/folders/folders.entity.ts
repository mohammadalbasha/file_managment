import { User } from "src/users/users.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany, AfterInsert } from "typeorm"; 
import { File } from "src/files/files.entity";

@Entity()
export class Folder {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    foldername: string;

    @Column({default: 'private'})
    type: 'private' | 'public'

    @ManyToOne(() => User, (user) => user.myfolders, { onDelete: 'CASCADE' })
    @JoinTable({name: 'ownerId'})
    owner?: User;

    @Column()
    ownerId?: number;

    @ManyToMany(() => User, (user) => user.my_accessable_folders, { onDelete: 'CASCADE' })
    @JoinTable()
    authorized_users?: User[];

    @ManyToMany(() => File, (file) => file.containing_folders, { onDelete: 'CASCADE' })
    @JoinTable()
    files?: File[];

    @OneToMany(() => File, (file) => file.locking_folder, { onDelete: 'CASCADE' })
    locked_files: File[];

    @AfterInsert()
    checkType(){
        if (this.ownerId == 1){
            this.type = 'public';
        }
    }
}