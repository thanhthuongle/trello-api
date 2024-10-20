import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API to get list boards' })
  })
  .post(boardValidation.createNewBoard, boardController.createNewBoard)

export const boardRoute = Router
