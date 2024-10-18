import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'

const createNewBoard = async (req, res, next) => {
  const CorrectCondition = Joi.object({
    title: Joi.string().min(3).max(50).required().trim().strict(),
    description: Joi.string().min(3).max(256).required().trim().strict()
  })

  try{
    // console.log('req:', req.body)
    await CorrectCondition.validateAsync(req.body, { abortEarly: false })

    // next()

    res.status(StatusCodes.CREATED).json({ message: 'API to create new board' })
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ errors: new Error(error).message })
  }
}

export const boardValidation = {
  createNewBoard
}