import {
    CanActivate,
    ExecutionContext,
    Injectable
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { FoldersService } from '../folders.service';

@Injectable()
export class FolderOwnerGuard implements CanActivate {

    constructor(private folderService: FoldersService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { currentUser } = request;
        let folder_id = request.body.folder_id;
        folder_id = parseInt(folder_id);
        const folder = await this.folderService.findOne(folder_id);
        // I can do some Authorization here
        return (folder.owner.id === currentUser.id);
    }
}