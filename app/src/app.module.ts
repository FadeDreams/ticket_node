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

import { WinstonLogger } from './winston-logger';
import expressWinston from 'express-winston';
import promBundle from 'express-prom-bundle';

const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
});

export class AppModule {
    private static instance: AppModule;
    private databaseConnected: boolean = false;

    constructor(public app: Application = express()) {
        // Use Winston for logging
        const winstonLogger = new WinstonLogger().getLogger();
        this.app.use(expressWinston.logger({
            winstonInstance: winstonLogger,
            meta: true, // Includes metadata in logs (default to true)
            msg: 'HTTP {{req.method}} {{req.url}}',
            expressFormat: true,
            colorize: false,
        }));
        this.app.use(metricsMiddleware);
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
                    sameSite: 'lax', // CSRF protection
                    secure: false, // cookie only works in HTTPS
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

    private validateEnvVariables() {
        const requiredEnvVariables = [
            'MONGO_URI',
            'JWT_KEY',
            'STRIPE_KEY',
            'REDIS_HOST',
            'PORT',
        ];

        const missingEnvVariables = requiredEnvVariables.filter((envVar) => !process.env[envVar]);

        if (missingEnvVariables.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missingEnvVariables.join(', ')}`
            );
        }
    }

    private async connectDatabase() {
        if (!this.databaseConnected) {
            try {
                await mongoose.connect(process.env.MONGO_URI!);
                this.databaseConnected = true;
                console.log('Database connected successfully.');
            } catch (err) {
                throw new Error('Database connection error: ' + err.message);
            }
        }
    }

    public async start() {
        try {
            // Validate environment variables
            this.validateEnvVariables();

            // Connect to the database
            await this.connectDatabase();

            this.app.use(currentUser(process.env.JWT_KEY!));
            this.app.use(errorHandler);
            this.app.use(authRouters);
            this.app.use(providerRouters);

            // Use Winston for error logging
            const winstonLogger = new WinstonLogger().getLogger();
            this.app.use(expressWinston.errorLogger({
                winstonInstance: winstonLogger,
                meta: true, // Includes metadata in logs (default to true)
            }));

            const PORT = parseInt(process.env.PORT as string, 10) || 3000;
            this.app.listen(PORT, '0.0.0.0', () => console.log('Server is running on port: ' + PORT));
        } catch (error) {
            console.error('Startup error:', error.message);
            process.exit(1);
        }
    }
}

// Usage
const myApp = AppModule.getInstance();
myApp.start();

