import express, { Application } from 'express';

import * as dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import mongoose from 'mongoose';

import { json, urlencoded } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, currentUser } from '@fadedreams7pcplatform/common';

import { authRouters } from './auth/auth.routers';
import { providerRouters } from './provider/provider.routers';

//import multer from 'multer';

export class AppModule {
  constructor(public app: Application = express()) {
    app.set('trust-proxy', true)

    app.use(cors({
      credentials: true,
      optionsSuccessStatus: 200
    }))

    //this.app.use(multer().any());
    app.use(urlencoded({ extended: false }))
    app.use(json())
    app.use(cookieSession({
      signed: false,
      secure: false
    }))

    Object.setPrototypeOf(this, AppModule.prototype)
  }

  async start() {
    if (!process.env.MONGO_URI) {
      throw new Error('mongo_uri must be defined')
    }

    if (!process.env.JWT_KEY) {
      throw new Error('mongo_uri must be defined')
    }

    if (!process.env.STRIPE_KEY) {
      throw new Error('STRIPE_KEY must be defined')
    }

    try {
      await mongoose.connect(process.env.MONGO_URI)
    } catch (err) {
      throw new Error('database connection error')
    }

    this.app.use(currentUser(process.env.JWT_KEY!))
    this.app.use(errorHandler)
    this.app.use(authRouters)
    this.app.use(providerRouters)



    const PORT = process.env.PORT || 8080

    this.app.listen(PORT, () => console.log('OK! port: ' + PORT))
  }
}
