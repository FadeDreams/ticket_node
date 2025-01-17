
import mongoose from 'mongoose';
import { Logger } from 'winston';

class Database {
    private databaseUrl: string;
    private maxRetries: number;
    private retryDelay: number;
    private currentRetries: number;
    private circuitState: 'closed' | 'open' | 'half-open'; // State of the circuit breaker
    private circuitBreakerCooldown: number; // Cooldown time in ms
    private lastFailureTime: number; // Time of last failure
    private logger: Logger; // Logger instance

    // Instance-level variable to track MongoDB connection status
    public isConnected: boolean = false; // Initially set to false

    // Constructor accepting connection configuration parameters and logger
    constructor(
        logger: Logger,
        databaseUrl: string = process.env.DB_URI || 'mongodb://localhost:27017/artistdb1',
        maxRetries: number = 5,
        retryDelay: number = 2000, // Delay between retries (in ms)
        circuitBreakerCooldown: number = 30000 // Cooldown time for circuit breaker (30 seconds)
    ) {
        this.logger = logger;
        this.databaseUrl = databaseUrl;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
        this.circuitState = 'closed'; // Initial state of the circuit breaker is 'closed'
        this.circuitBreakerCooldown = circuitBreakerCooldown;
        this.lastFailureTime = 0; // Initialize time of last failure
        this.currentRetries = 0;
        this.connectWithRetry();
    }

    // Function to connect to MongoDB
    private async connect() {
        try {
            this.logger.info('Attempting to connect to MongoDB...');
            await mongoose.connect(this.databaseUrl); // No options needed here
            this.logger.info('Connected to MongoDB');
            this.isConnected = true; // Set the status to true on successful connection
            this.currentRetries = 0; // Reset retry count on successful connection
            this.circuitState = 'closed'; // Close the circuit on successful connection
        } catch (error: any) {
            this.logger.error('Error connecting to MongoDB:', error.message);
            this.isConnected = false; // Set the status to false on failure
            throw error;
        }
    }

    // Function to handle retries and implement the circuit breaker pattern
    public async connectWithRetry() {
        if (this.circuitState === 'open') {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;
            if (timeSinceLastFailure < this.circuitBreakerCooldown) {
                this.logger.info(`Circuit is open. Retry cooldown active. Retrying in ${this.circuitBreakerCooldown / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, this.circuitBreakerCooldown));
                this.circuitState = 'half-open'; // Half-open to test reconnection
            } else {
                this.logger.info('Cooldown period over, retrying connection...');
                this.circuitState = 'half-open';
            }
        }

        // If circuit is closed or half-open, attempt connection
        if (this.circuitState === 'closed' || this.circuitState === 'half-open') {
            try {
                await this.connect();
                this.currentRetries = 0; // Reset retries on successful connection
                this.lastFailureTime = 0; // Reset last failure time on success
            } catch (error) {
                this.currentRetries++;
                this.logger.info(
                    `Retry attempt ${this.currentRetries}/${this.maxRetries} failed. Retrying in ${this.retryDelay / 1000} seconds...`
                );
                await new Promise((resolve) => setTimeout(resolve, this.retryDelay));

                // If max retries reached, open the circuit
                if (this.currentRetries >= this.maxRetries) {
                    this.logger.error('Max retry attempts reached. Opening the circuit.');
                    this.circuitState = 'open'; // Open the circuit if retries are exhausted
                    this.lastFailureTime = Date.now(); // Set the failure time for cooldown
                }
            }
        }
    }

    public monitorConnection() {
        mongoose.connection.on('disconnected', async () => {
            this.logger.warn('MongoDB connection lost. Attempting to reconnect...');
            this.isConnected = false; // Update the status when disconnected
            await this.connectWithRetry();
        });

        mongoose.connection.on('error', (error: any) => {
            this.logger.error('MongoDB encountered an error:', error.message);
            this.isConnected = false; // Update the status on error
        });

        mongoose.connection.on('connected', () => {
            this.logger.info('MongoDB reconnected');
            this.isConnected = true; // Update the status when connected
        });

        mongoose.connection.on('reconnected', () => {
            this.logger.info('MongoDB reconnected');
            this.isConnected = true; // Update the status when reconnected
        });

        mongoose.connection.on('close', () => {
            this.logger.info('MongoDB connection closed');
            this.isConnected = false; // Update the status when the connection is closed
        });
    }
}

export default Database;
export { Database }; // Export the Database class so we can access isConnected status from other modules
