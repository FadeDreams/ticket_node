import os from 'os';
import { AppState } from '../states/AppState';
import { NormalState } from '../states/NormalState';
import { UrgentState } from '../states/UrgentState';
import { Application } from 'express';

export class AppContext {
    private currentState: AppState; // Keep currentState private

    constructor(private app: Application) {
        // Start in Normal mode by default
        this.currentState = new NormalState(app);
        this.currentState.handle(); // Explicitly set the app to Normal mode on startup
    }

    // Getter method to access currentState
    public getCurrentState(): AppState {
        return this.currentState;
    }

    setState(state: AppState): void {
        this.currentState = state;
        this.currentState.handle(); // Apply the new state's behavior
    }

    monitorResources(): void {
        const cpuUsage = os.loadavg()[0]; // 1-minute CPU load average
        const memoryUsage = os.freemem() / os.totalmem(); // Free memory ratio
        console.log(cpuUsage, memoryUsage);

        if (cpuUsage > 0.8 || memoryUsage < 0.2) {
            this.setState(new UrgentState(this.app)); // Switch to Urgent mode if CPU or memory is under stress
        } else {
            this.setState(new NormalState(this.app)); // Otherwise, stay in Normal mode
        }
    }
}
