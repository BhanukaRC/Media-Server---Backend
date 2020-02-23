
import { Request, Response } from "express";
import { MongooseDocument } from "mongoose";
import { MediaFile } from '../models/mediaFile';
import { MediaFileSchema } from "../databaseSchemas/mediaFileSchema";
import { PERMISSION_LEVEL } from "../constants/media-server.constants";
import fs from 'fs';
import MulterRequest from '../models/multerRequest';
import { ServerResponseTemplate } from "../models/serverResponse";

export class FileService {


    constructor() {
    }

    public async createFile(file: MediaFile, data: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let fullpath = file.getFullPath();
            fs.writeFile(fullpath, data, function (err) {
                if (err) {
                    console.log(err);
                    return reject(false);
                }
                console.log("File created!");
                return resolve(true);
            });
        })

    }

    public async createDirectoryStructure(path: string): Promise<boolean> {
        let filepath = path.split('/');
        let fullpath = '';
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < filepath.length; i++) {
                if (i != 0) {
                    fullpath = fullpath + '/' + filepath[i];
                } else {
                    fullpath = filepath[0];
                }
                const success = await this.createSingleFolder(fullpath);
                if (!success) {
                    return reject(false);
                }
            }
            return resolve(true);
        });

    }

    public async createSingleFolder(fullpath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.mkdir(fullpath, PERMISSION_LEVEL, function (err) {
                if (err) {
                    if (err.code == 'EEXIST') {
                        resolve(true);
                        // File already exists
                    } else {
                        console.log(err);
                        return reject(false);
                    }
                }
                resolve(true);
            });
        });
    }

    public checkFileExistence(filePath: string) {
        if (fs.existsSync(filePath)) {
            return true;
            // File exists in path
        } else {
            return false;
            // File doesn't exist in path
        }
    }

    public deleteFileFromDirectory(path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                fs.unlinkSync(path);
                return resolve(true);
            } catch (err) {
                console.error(err);
                return reject(false);
            }
        })

    }

    // public async deleteFolder(path: string) {
    //     let folderBreaks: number[] = [];
    //     for (let i = 0; i < path.length; i++) {
    //         const character = path.charAt(i);
    //         if (character === '/') {
    //             folderBreaks.push(i);
    //         }
    //     }
    //     folderBreaks.splice(0.2);
    //     if(folderBreaks.length>0){
    //         for(let slash in folderBreaks){
    //             console.log(path.substring(0,Number(slash)));
    //         }
    //     }
    // }

    public async downloadFile(req: Request, res: Response) {

        let requestedFile = new MediaFile(req.query);
        const validity = await MediaFileSchema.findOne({ _id: req.query.id, ownerId: req.query.ownerId }, (error: Error, media: MediaFile) => {
            if (error) {
                res.send(null);
                return false;
            }
            if (media == null) {
                res.send(null);
                return false;
            } else {
                requestedFile = new MediaFile(media);
                return true;
            }
        });
        if (validity) {
            try {
                let file = fs.createReadStream(__dirname + '/../../' + requestedFile.getFullPath());
                file.on('open', function () {
                    file.pipe(res);
                })
            }
            catch (err) {
                res.send(err);
            }
        }

    }

    //Non atomic
    //Db -> File
    public deleteFile(req: Request, res: Response) {
        const mediaFile = new MediaFile(req.body);
        let response: ServerResponseTemplate = new ServerResponseTemplate();
        console.log(req.body);
        MediaFileSchema.findOneAndDelete({ ownerId: mediaFile.ownerId, _id: mediaFile.id }, async (error: Error, deleted: any) => {
            if (error) {
                res.send(error);
                return;
            }
            try {
                const success: boolean = await this.deleteFileFromDirectory(mediaFile.getFullPath());
                if (success && deleted != null) {
                    response.message = 'File deleted successfully';
                    response.ack = true;
                } else {
                    response.message = 'Error occured while deleting the file';
                    response.ack = false;
                }

                res.send(response);
            } catch (err) {
                res.send(err);
            }

        });
    }

    public async addNewFile(req: MulterRequest, res: Response) {

        try {

            let file = new MediaFile(JSON.parse(req.body.details));
            const newFile = new MediaFileSchema(file);
            let response: ServerResponseTemplate = new ServerResponseTemplate();


            // Check for duplicates
            if (!this.checkFileExistence(file.getFullPath())) {
                newFile.save(async (error: Error, ack: MongooseDocument) => {
                    if (error) {
                        res.send(error);
                        return;
                    } else {
                        // Create directory
                        const success = await this.createDirectoryStructure(file.getLocationPath());
                        if (success) {
                            const fileCreation = await this.createFile(file, req.file.buffer);
                            if (fileCreation) {
                                response.message = 'File created successfully!';
                                response.ack = true;
                                res.json(response);
                                return;
                            } else {
                                response.message = 'Cannot upload file';
                                response.ack = false;
                                res.json(response);
                                return;
                            }

                        } else {
                            response.message = 'Wrong file path';
                            response.ack = false;
                            res.json(response);
                            return;
                        }
                    }
                });

            } else {
                response.message = 'File already exists';
                response.ack = false;
                res.json(response);
                return;
            }

        }
        catch (err) {
            res.send(err);
            return;
        }

    }

    public getFilesofUser(ownerId: String): Promise<MediaFile[]> {
        return new Promise((resolve, reject) => {
            MediaFileSchema.find({ ownerId: ownerId }, (error: Error, files: MediaFile[]) => {
                if (error) {
                    return reject(error);
                }
                return resolve(files);
            });
        });
    }


    public async getFiles(req: Request, res: Response) {
        try {
            const files: MediaFile[] = await this.getFilesofUser(req.body.id);
            res.json(files);
        } catch (error) {
            res.send(error);
        }
    }

























}