import {
    CanActivate,
    ExecutionContext,
    Injectable
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { FilesService } from '../files.service'

@Injectable()
export class FileLockerGuard implements CanActivate {

    constructor(private filesService: FilesService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { currentUser } = request;

        let folder_id  = request.body.folder_id;
        let file_id = request.body.file_id;
        if (!folder_id || !file_id){
            folder_id = request.query.folder_id;
            file_id = request.query.file_id;
        }
        if (!file_id || !folder_id){
            return false;
        }
        file_id = parseInt(file_id);
        folder_id = parseInt(folder_id);
        const file = await this.filesService.findOneById(file_id);
        // I can do some Authorization here
        return (file?.locker && file.locker.id == currentUser.id && file.locking_folder.id == folder_id);
    }
}