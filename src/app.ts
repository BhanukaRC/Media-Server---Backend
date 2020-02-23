
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Controller } from './main.controller';
import mongoose from 'mongoose';
import { MONGO_URL } from './constants/media-server.constants'


class App {

  public app: Application;
  public mediaController: Controller;

  constructor() {
    this.app = express();

    this.setConfig();
    this.setMongoConfig();
    this.mediaController = new Controller(this.app);
  }

  private setConfig() {
    //Allows us to receive requests with data in json format
    this.app.use(bodyParser.json({ limit: '500mb' }));

    //Allows us to receive requests with data in x-www-form-urlencoded format
    this.app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

    //Enables cors   
    this.app.use(cors());
  }

  //Connecting to MongoDB database
  private setMongoConfig() {
    mongoose.Promise = global.Promise;
    mongoose.connect(MONGO_URL, {
      useNewUrlParser: true
    });
  }

}

export default new App().app;
