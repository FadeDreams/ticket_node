import { AppModule } from './app.module'
import express from 'express'
import { JwtPayload } from '@fadedreams7org1/common'

declare global {
    namespace Express {
        interface Request {
            currentUser?: JwtPayload;
            uploaderError?: Error
        }
    }
}

const bootstrap = () => {
    const app = new AppModule(express())

    app.start()
}

bootstrap()
