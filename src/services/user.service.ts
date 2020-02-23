
import { Request, Response } from "express";
import { UserSchema } from "../databaseSchemas/userSchema";
import { MongooseDocument } from "mongoose";
import { User } from '../models/user';
import bcrypt from "bcrypt";
import { SALT_LIMIT } from "../constants/media-server.constants";
import { ServerResponseTemplate } from "../models/serverResponse";

export class UserService {

    public getAllUsers(req: Request, res: Response) {
        UserSchema.find({}, '-password', (error: Error, users: User[]) => {
            if (error) {
                res.send(error);
                return;
            }
            res.json(users);
        });
    }

    public getUserDetails(req: Request, res: Response) {
        let user = new User(req.body);
        UserSchema.find({ username: user.username }, '-password', (error: Error, relevantUser: User) => {
            if (error) {
                res.send(error);
                return;
            }
            res.json(relevantUser);
        });
    }

    public async addNewUser(req: Request, res: Response) {
        try {
            let userModel = new User(req.body);
            let serverResponseTemplate = new ServerResponseTemplate();
            userModel.password = await bcrypt.hash(userModel.password, SALT_LIMIT);
            const newUser = new UserSchema(userModel);
            newUser.save((error: Error, user: MongooseDocument) => {
                if (error) {
                    serverResponseTemplate.ack = false;
                    serverResponseTemplate.message = error.message;
                    res.send(serverResponseTemplate);
                    return;
                }
                serverResponseTemplate.ack = true;
                serverResponseTemplate.results = user.id;
                serverResponseTemplate.message = 'User added successfully';
                res.json(serverResponseTemplate);
            });
        } catch (err) {
            res.send(err);
        }

    }

    public deleteUser(req: Request, res: Response) {
        const userName = req.body.username;
        UserSchema.findOneAndDelete({ username: userName }, (error: Error, deleted: any) => {
            if (error) {
                res.send(error);
                return;
            }
            let response: ServerResponseTemplate = new ServerResponseTemplate();
            response.message = deleted ? 'Deleted successfully' : 'User not found :(';
            res.send(response);
        });
    }

    public authenticateUser(req: Request, res: Response) {
        // can be improved => wrong password? wrong username?
        let user = new User(req.body);
        console.log(user);
        let response: ServerResponseTemplate = new ServerResponseTemplate();
        UserSchema.findOne({ username: user.username }, 'password', (error: Error, userDetails: User) => {
            if (error) {
                res.send(error);
                return;
            }
            if (userDetails == null) {
                response.ack = false;
            } else {
                console.log(userDetails);
                let validatedUser: User = new User(userDetails);
                let hash: string = userDetails.password.toString();
                response.ack = bcrypt.compareSync(user.password, hash);
                response.results = validatedUser.id;
            }
            res.send(response);
        });
    }

    public findUser(id: String): Promise<boolean> {
        return new Promise((resolve, reject) => {
            UserSchema.findOne({ _id: id }, '-password', (error: Error, user: User) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(user != null);
                }
            });
        });
    }

    public async updateUser(req: Request, res: Response) {

        try {
            const updatedUser = new User(req.body);
            //get password
            const success = await UserSchema.findById(updatedUser.id, (error: Error, relevantUser: User) => {
                if (error) {
                    res.send(error);
                    return false;;
                }
                updatedUser.password = relevantUser.password;
                return true;
            });
            if (success) {
                UserSchema.findByIdAndUpdate(
                    updatedUser.id,
                    updatedUser,
                    { runValidators: true },
                    (error: Error, updated: any) => {
                        if (error) {
                            res.send(error);
                            return;
                        }
                        let response: ServerResponseTemplate = new ServerResponseTemplate();
                        if (updated) {
                            response.ack = true;
                            response.message = 'User updated successfully'
                        } else {
                            response.ack = false;
                            response.message = 'User not found!';
                        }
                        res.send(response);
                    });
            }
        } catch (err) {
            res.send(err);
        }
    }

















}