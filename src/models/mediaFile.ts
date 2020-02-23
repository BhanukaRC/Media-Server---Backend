import { FILE_TYPES, ROOT_FOLDER } from "../constants/media-server.constants";

export class MediaFile {

    ownerId: String;
    size: String;
    fileName: String;
    path: String;
    fileType: String;
    file: any;
    format: string;
    date: string;
    id: string;

    constructor(jsonObject: any) {
        this.ownerId = jsonObject.ownerId;
        this.size = jsonObject.size;
        this.fileName = jsonObject.fileName;
        if(this.fileName != null && this.fileName != undefined){
            this.fileName = this.fileName.replace(/\s+/g, '');
        }
        this.path = jsonObject.path;
        if(this.path != null && this.path != undefined){
            this.path = this.path.replace(/\s+/g, '');
        }
        this.format = jsonObject.format;
        this.date = jsonObject.date;

        if(jsonObject._id == '' || jsonObject._id == undefined || jsonObject._id == null){
            this.id = jsonObject.id;
        } else {
            this.id = jsonObject._id;
        }

        if (this.checkType(jsonObject.fileType)) {
            this.fileType = jsonObject.fileType;
        } else {
            this.fileType = FILE_TYPES[3];
        }
    };

    checkType(type: string) {
        for (let i = 0; i < FILE_TYPES.length; i++) {
            if (FILE_TYPES[i] === type) {
                return true;
            }
        }
        return false;
    }

    getFullPath() {
        if (this.path != null) {
            return (ROOT_FOLDER + '/' + this.ownerId + '/' + this.path + '/' + this.fileName + '.' + this.format);
        } else {
            return (ROOT_FOLDER + '/' + this.ownerId + '/' + this.fileName + '.' + this.format);
        }

    }

    getLocationPath() {
        if (this.path != null) {
            return (ROOT_FOLDER + '/' + this.ownerId + '/' + this.path);
        } else {
            return (ROOT_FOLDER + '/' + this.ownerId);
        }
    }

    setFile(data: any) {
        this.file = data;
    }
}
