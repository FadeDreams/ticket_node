import { AppModule } from './app.module'
import express from 'express'
import { JwtPayload } from '@fadedreams7pcplatform/common'

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
