import { Resolver, Args, ResolveField, Query, Parent, Mutation } from "@nestjs/graphql";
import { FoldersService } from "./folders.service";

@Resolver('Author')
export class FolderssResolver {
  constructor(
    private foldersService: FoldersService,
  ) {}

  @Query()
  async folders() {
    return this.foldersService.findAll();
  }


  
  @Mutation()
  async updateFolderName(@Args('folder_id') folder_id: number, @Args('foldername') foldername: string) {
    const folder = await this.foldersService.updateName(folder_id, foldername);
    return folder;
}



//   @Query()
//   async author(@Args('id') id: number) {
//     return this.authorsService.findOneById(id);
//   }

//   @ResolveField()
//   async posts(@Parent() author) {
//     const { id } = author;
//     return this.postsService.findAll({ authorId: id });
//   }
}
