// app/src/infrastructure/logging/Logger.ts
import winston from 'winston';

class Logger {
    private static instance: winston.Logger;

    // Private constructor to prevent instantiation
    private constructor() {}

    // Static method to get the logger instance
    public static getLogger(): winston.Logger {
        if (!Logger.instance) {
            Logger.instance = winston.createLogger({
                level: 'info', // Logging level
                format: winston.format.combine(
                    winston.format.timestamp(), // Add timestamp to logs
                    winston.format.printf(({ timestamp, level, message }) => {
                        return `[${timestamp}] ${level}: ${message}`;
                    })
                ),
                transports: [
                    new winston.transports.Console(), // Log to the console
                    new winston.transports.File({ filename: 'logs/app.log' }) // Log to a file
                ]
            });
        }
        return Logger.instance;
    }
}

export default Logger;
