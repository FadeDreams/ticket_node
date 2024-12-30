// app/src/infrastructure/logging/Logger.ts
import winston from 'winston';

// Create a logger instance
const logger = winston.createLogger({
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

export default logger;
