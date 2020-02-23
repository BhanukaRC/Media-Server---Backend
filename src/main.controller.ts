
import { Application } from 'express';
import { UserService } from './services/user.service';
import { FileService } from './services/file.service'
import multer from 'multer';

export class Controller {

    private userService: UserService;
    private fileService: FileService;
    private upload:any;
    private storage:multer.StorageEngine;

    constructor(private app: Application) {
        
        this.storage = multer.memoryStorage()
        this.upload = multer({storage:this.storage});
        this.userService = new UserService();
        this.fileService = new FileService();
        this.routes();

    }

    public routes() {

        //users
        this.app.route('/user').get(this.userService.getAllUsers);
        this.app.route("/user/signup").post(this.userService.addNewUser.bind(this.userService));
        this.app.route("/user/delete").delete(this.userService.deleteUser);
        this.app.route("/user/login/").post(this.userService.authenticateUser);
        this.app.route("/user/details").post(this.userService.getUserDetails);
        this.app.route("/user/update").put(this.userService.updateUser);

        //mediaFiles
        this.app.route("/media").post(this.upload.single('file'), this.fileService.addNewFile.bind(this.fileService));
        this.app.route("/media/view").post(this.fileService.getFiles.bind(this.fileService));
        this.app.route("/media/download").get(this.fileService.downloadFile.bind(this.fileService));
        this.app.route("/media/delete").delete(this.fileService.deleteFile.bind(this.fileService));
    }
}