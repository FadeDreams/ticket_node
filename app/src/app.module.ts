
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

import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import session from 'express-session';

export class AppModule {
  private static instance: AppModule;
  private databaseConnected: boolean = false;

  constructor(public app: Application = express()) {
    app.set('trust-proxy', true);

    app.use(cors({
      credentials: true,
      optionsSuccessStatus: 200
    }));

    app.use(urlencoded({ extended: false }));
    app.use(json());

    const RedisClnt = new Redis({ host: 'redis' });
    const RedisStore = require("connect-redis").default;
    const redisStore = new RedisStore({ client: RedisClnt });

    app.use(
      session({
        name: 'qid',
        store: redisStore,
        proxy: true,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          httpOnly: true,
          sameSite: 'lax', // csrf
          secure: false, // cookie only works in https
        },
        saveUninitialized: false,
        secret: 'secret',
        resave: false,
      })
    );

    Object.setPrototypeOf(this, AppModule.prototype);
  }

  public static getInstance(): AppModule {
    if (!AppModule.instance) {
      AppModule.instance = new AppModule();
    }
    return AppModule.instance;
  }

  private async connectDatabase() {
    if (!this.databaseConnected) {
      if (!process.env.MONGO_URI) {
        throw new Error('mongo_uri must be defined');
      }

      try {
        await mongoose.connect(process.env.MONGO_URI);
        this.databaseConnected = true;
      } catch (err) {
        throw new Error('database connection error');
      }
    }
  }

  public async start() {
    await this.connectDatabase();

    if (!process.env.JWT_KEY) {
      throw new Error('JWT_KEY must be defined');
    }

    if (!process.env.STRIPE_KEY) {
      throw new Error('STRIPE_KEY must be defined');
    }

    this.app.use(currentUser(process.env.JWT_KEY!));
    this.app.use(errorHandler);
    this.app.use(authRouters);
    this.app.use(providerRouters);

    const PORT = parseInt(process.env.PORT as string, 10) || 3000;
    this.app.listen(PORT, '0.0.0.0', () => console.log('OK! port: ' + PORT));
  }
}

// Usage
const myApp = AppModule.getInstance();
myApp.start();

