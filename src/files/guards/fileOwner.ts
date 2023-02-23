import {
    CanActivate,
    ExecutionContext,
    Injectable
} from '@nestjs/common'
import { FilesService } from '../files.service'

@Injectable()
export class FileOwnerGuard implements CanActivate {

    constructor(private filesService: FilesService) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { currentUser } = request;
        let { file_id } = request.params;
        file_id = parseInt(file_id);
        const file = await this.filesService.findOneById(file_id);
        console.log(file_id)
        // I can do some Authorization here
        return (file.owner.id == currentUser.id);
    }
}