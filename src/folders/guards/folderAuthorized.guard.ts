import {
    CanActivate,
    ExecutionContext,
    Injectable
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { FoldersService } from '../folders.service';


@Injectable()
export class FolderAuthorizedGuard implements CanActivate {
    constructor(private foldersService: FoldersService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { currentUser } = request;
        let { folder_id } = request.body;
        if (!folder_id){
            folder_id = request.params.folder_id;
        }
        const { files_ids } = request.body;
        console.log(folder_id)
        const folder = await this.foldersService.findOne(parseInt(folder_id));
        
        let user_auth = false;
        folder.authorized_users.forEach(user => {
            if (user.id == currentUser.id)
                user_auth = true;
        })
        if (folder_id == 1)
            user_auth = true;

        // for (let i = 0 ; i < files_ids?.length ; i++){
        //     let file_auth = false;
        //     for (let j = 0 ; j < folder.files.length ; j++)
        //         if (folder.files[j].id == files_ids[i])
        //             file_auth = true;
        //     user_auth = user_auth && file_auth;
        //     }

        return user_auth;
    }
}