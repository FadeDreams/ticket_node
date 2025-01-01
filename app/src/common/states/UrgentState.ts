import { AppState } from './AppState';
import { Application } from 'express';
import { WinstonLogger } from '../winston-logger';
import expressWinston from 'express-winston';

export class UrgentState implements AppState {
    constructor(private app: Application) { }

    handle(): void {
        console.log("App is running in URGENT mode.");
        this.reduceLogging();
        this.disableNonCriticalFeatures();
    }

    private reduceLogging(): void {
        const winstonLogger = new WinstonLogger().getLogger();
        this.app.use(expressWinston.errorLogger({
            winstonInstance: winstonLogger,
            meta: true,
        }));
        console.log("Logging is reduced to errors only.");
    }

    private disableNonCriticalFeatures(): void {
        // Disable providerRouters in Urgent mode
        this.app.use((req, res, next) => {
            if (req.path.startsWith('/provider')) {
                res.status(503).json({ message: "Provider features are temporarily unavailable in URGENT mode." });
            } else {
                next();
            }
        });
        console.log("Provider features are disabled.");
    }
}
