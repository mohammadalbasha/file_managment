import { Folder } from "src/folders/folders.entity";
import { User } from "src/users/users.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { File } from "./files.entity";

@Entity()
export class Report{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => File, (file) => file.reports, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'fileId'})
    file: File;

    @Column()
    fileId: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'userId'})
    user: User;

    @Column()
    userId: number;
    
    @ManyToOne(() => Folder, (folder) => folder.id, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'folderId'})
    folder?: Folder;

    @Column({nullable: true})
    folderId?: number;
    
    @Column({ type: 'datetime'})
    date: Date;

    // @Column('enum')
    // operation: 'create' | 'update' | 'add-to-folder' | 'remove-from-folder' | 'lock' | 'unlock' | 'delete'

    @Column()
    operation: string;
}   