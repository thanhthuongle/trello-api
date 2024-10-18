import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from './boardRoutes'

const Router = express.Router()

Router.get('/', (req, res) => {
  res.end('<h1>Hello World!</h1><hr>')
})

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'APIs v1 are ready to use'
  })
})

Router.use('/boards', boardRoutes)

export const APIs_V1 = Router