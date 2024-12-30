import express, { Application } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import mongoose from 'mongoose';
import { json, urlencoded } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, currentUser } from '@fadedreams7org1/common';
import { authRouters } from './auth/auth.routers';
import { providerRouters } from './provider/provider.routers';
import session from 'express-session';

import { WinstonLogger } from './winston-logger';
import expressWinston from 'express-winston';
import promBundle from 'express-prom-bundle';
import { AppContext } from './context/AppContext'; // Import AppContext
import { UrgentState } from './states/UrgentState'; // Import UrgentState

const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
});

export class AppModule {
    private static instance: AppModule;
    private databaseConnected: boolean = false;
    private appContext: AppContext; // Add AppContext

    constructor(public app: Application = express()) {
        this.appContext = new AppContext(this.app); // Initialize AppContext with NormalState by default
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

            // Start monitoring resources
            setInterval(() => this.appContext.monitorResources(), 5000); // Check every 5 seconds

            this.app.use(currentUser(process.env.JWT_KEY!));
            this.app.use(errorHandler);
            this.app.use(authRouters);

            // Conditionally add providerRouters based on the current state
            this.app.use((req, res, next) => {
                if (!(this.appContext.getCurrentState() instanceof UrgentState)) {
                    this.app.use(providerRouters);
                }
                next();
            });

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

// const myApp = AppModule.getInstance();
// myApp.start();
