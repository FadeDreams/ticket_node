import { AppState } from './AppState';
import { Application } from 'express';
import { WinstonLogger } from '../winston-logger';
import expressWinston from 'express-winston';

export class NormalState implements AppState {
    constructor(private app: Application) { }

    handle(): void {
        console.log("App is running in NORMAL mode.");
        this.enableFullLogging();
        this.enableAllFeatures();
    }

    private enableFullLogging(): void {
        const winstonLogger = new WinstonLogger().getLogger();
        this.app.use(expressWinston.logger({
            winstonInstance: winstonLogger,
            meta: true,
            msg: 'HTTP {{req.method}} {{req.url}}',
            expressFormat: true,
            colorize: false,
        }));
        console.log("Full logging is enabled.");
    }

    private enableAllFeatures(): void {
        // Enable all features, including providerRouters
        this.app.use((req, res, next) => {
            console.log("All features, including provider routes, are enabled.");
            next();
        });
    }
}
