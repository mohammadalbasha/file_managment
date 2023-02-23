import {
    CanActivate,
    ExecutionContext,
    Injectable
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { FoldersService } from '../folders.service';


@Injectable()
export class FilesAuthorizedGuard implements CanActivate {
    constructor(private foldersService: FoldersService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { currentUser } = request;
        const { folder_id } = request.body;
        const { files_ids } = request.body;

        const folder = await this.foldersService.findOne(parseInt(folder_id));
        console.log(folder)
        let user_auth = false;
        folder.authorized_users.forEach(user => {
            if (user.id == currentUser.id)
                user_auth = true;
        })
        
        if (folder_id == 1)
            user_auth = true;

        for (let i = 0 ; i < files_ids?.length ; i++){
            let file_auth = false;
            for (let j = 0 ; j < folder.files.length ; j++)
                if (folder.files[j].id == files_ids[i])
                    file_auth = true;
            user_auth = user_auth && file_auth;
            }

        return user_auth;
    }
}