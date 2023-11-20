import { AppModule } from './app.module'
import express from 'express'

const bootstrap = () => {
  const app = new AppModule(express())

  app.start()
}

bootstrap()
