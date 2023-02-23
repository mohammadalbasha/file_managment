import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, OneToMany, JoinColumn } from "typeorm";
import { User } from "src/users/users.entity";
import { Folder } from "src/folders/folders.entity";
import { Report } from "./reports.entity";
import { report } from "process";

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    filename: string;

    @Column()
    originalname: string;

    @Column({nullable: false})
    path: string;

    @Column({default: false})
    is_locked: boolean;

    @ManyToOne(() => User, (user) => user.locked_files, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'lockerId'})
    locker?: User;

    @Column({nullable: true, default: null})
    lockerId?: number | null; 

    @ManyToOne(() => User, (user) => user.myfiles, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'ownerId'})
    owner?: User;

    @Column()
    ownerId?: number;
    

    @ManyToMany(() => Folder, (folder) => folder.files, { onDelete: 'CASCADE' })
    containing_folders?: Folder[];

    @ManyToOne(() => Folder, (folder) => folder.locked_files, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'lockingFolderId'})
    locking_folder?: Folder;

    @Column({nullable: true, default: null})
    lockingFolderId?: number;



    @OneToMany(() => Report, (report) => report.file, { onDelete: 'CASCADE' })
    reports?: Report[];

}