import { Entity, AfterInsert, AfterRemove, AfterUpdate, Column, PrimaryGeneratedColumn, OneToMany, JoinTable, ManyToMany, DataSource, BeforeInsert } from "typeorm";
import { Exclude } from 'class-transformer';
import { File } from "src/files/files.entity";
import { Folder } from "src/folders/folders.entity";


@Entity()
export class User { 

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;
    
    @Column()
    password: string;

    @Column({default: 'user'})
    role: 'admin' | 'user'

    @OneToMany(() => File, (file) => file.owner, { onDelete: 'CASCADE' })
    myfiles?: File[];

    @OneToMany(() => File, (file) => file.locker, { onDelete: 'CASCADE' })
    locked_files?: File[];

    @OneToMany(() => Folder, (folder) => folder.owner, { onDelete: 'CASCADE' })
    myfolders?: Folder[];

    @ManyToMany(() => Folder, (folder) => folder.authorized_users, { onDelete: 'CASCADE' })
    my_accessable_folders?: Folder[];
    
    // not work 
    // @AfterInsert()
    // checkAdmin(){
    // this.role = 'admin';
    // }
    // @BeforeInsert()
    // checkADmin(){
    //     console.log(this)
    //  //   this.role = 'admin';
    // }

    // @AfterRemove()
    // logRemove(){
    //     console.log('User with id: ' + this.id + " has been removed" );
    // }
}