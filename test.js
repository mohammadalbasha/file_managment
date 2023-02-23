async create(queryRunner, file: Express.Multer.File, user: User) { // we use the same dto   

    try {
        const file_doc = this.repo.create();
        file_doc.path = file.path;
        file_doc.filename = file.filename;
        file_doc.originalname = file.originalname;
        file_doc.owner = user;
    
        const saved_file = await this.repo.save.save(file_doc);

         
        await this.reportService.createReport(file_doc.id, undefined, user.id, "create");
         /* OR */
         const report = this.reportRepo.create(......)
         await this.reportRepo.save(report)

         

        await clearCache(`files/${user.id}`);
        return saved_file;
    }
    catch (err) {
        console.log(err)
        fs.unlink(file.path, () => { });
        throw err;
    }
}


