import express, { Application } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, currentUser } from '@fadedreams7org1/common';
import RedisConnection from './infrastructure/persistence/RedisConnection';
import DatabaseConnection from './infrastructure/persistence/DatabaseConnection';

import { authRouters } from './presentation/auth/auth.routes'; // Updated path
import { providerRouters } from './presentation/provider/provider.routes'; // Updated path
import { consumerRouters } from './presentation/consumer/consumer.routes'; // Updated path
import session from 'express-session';
import { WinstonLogger } from './infrastructure/logging/winston-logger'; // Updated path
import expressWinston from 'express-winston';
import promBundle from 'express-prom-bundle';
import { AppContext } from './common/context/AppContext'; // Updated path
import { UrgentState } from './common/states/UrgentState'; // Updated path

const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
});

export class AppModule {
    private static instance: AppModule;
    private databaseConnected: boolean = false;
    private appContext: AppContext; // Add AppContext
    private redisConnection: RedisConnection;
    private databaseConnection: DatabaseConnection; // Add DatabaseConnection
    private server: ReturnType<Application['listen']>; // Store the server instance

    constructor(public app: Application = express()) {
        const winstonLogger = new WinstonLogger().getLogger();
        this.appContext = new AppContext(this.app); // Initialize AppContext with NormalState by default
        this.redisConnection = new RedisConnection();
        this.databaseConnection = new DatabaseConnection(winstonLogger, process.env.MONGO_URI!); // Initialize DatabaseConnection

        // Use Winston for logging
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

    private async checkRedisConnection(): Promise<void> {
        console.log('Redis connection status:', this.redisConnection.getStatus());

        const client = this.redisConnection.getClient();
        if (client) {
            try {
                await client.set('myKey', 'myValue');
                console.log('Key set successfully.');

                const value = await client.get('myKey');
                console.log('Value retrieved:', value);
            } catch (error) {
                console.log('Error using Redis:', error);
            }
        } else {
            console.log('Redis client is not connected.');
        }
    }

    private async connectDatabase(): Promise<void> {
        if (!this.databaseConnected) {
            try {
                await this.databaseConnection.connectWithRetry();
                this.databaseConnected = true;
                console.log('Database connected successfully.');
            } catch (err) {
                throw new Error('Database connection error: ' + err.message);
            }
        }
    }

    private async shutdown(): Promise<void> {
        console.log('Starting graceful shutdown...');

        // Close the HTTP server
        if (this.server) {
            this.server.close(() => {
                console.log('HTTP server closed.');
            });
        }

        // Disconnect from MongoDB
        if (this.databaseConnection.isConnected()) {
            await this.databaseConnection.disconnect();
            console.log('MongoDB disconnected.');
        }

        // Close the Redis connection
        const redisClient = this.redisConnection.getClient();
        if (redisClient) {
            await redisClient.quit();
            console.log('Redis connection closed.');
        }

        console.log('Graceful shutdown complete.');
        process.exit(0); // Exit the process
    }

    public async start() {
        try {
            // Validate environment variables
            this.validateEnvVariables();

            // Connect to the database
            await this.connectDatabase();
            await this.checkRedisConnection();

            // Start monitoring resources
            setInterval(() => this.appContext.monitorResources(), 5000); // Check every 5 seconds

            this.app.use(currentUser(process.env.JWT_KEY!));
            this.app.use(errorHandler);
            this.app.use(authRouters);
            this.app.use(providerRouters);
            this.app.use(consumerRouters); // Add consumerRouters

            // Use Winston for error logging
            const winstonLogger = new WinstonLogger().getLogger();
            this.app.use(expressWinston.errorLogger({
                winstonInstance: winstonLogger,
                meta: true, // Includes metadata in logs (default to true)
            }));

            const PORT = parseInt(process.env.PORT as string, 10) || 3000;
            this.server = this.app.listen(PORT, '0.0.0.0', () => console.log('Server is running on port: ' + PORT));

            // Handle shutdown signals
            process.on('SIGINT', () => this.shutdown());
            process.on('SIGTERM', () => this.shutdown());
        } catch (error) {
            console.error('Startup error:', error.message);
            process.exit(1);
        }
    }
}

// const myApp = AppModule.getInstance();
// myApp.start();
