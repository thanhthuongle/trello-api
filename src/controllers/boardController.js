import { StatusCodes } from 'http-status-codes'

const createNewBoard = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)
    res.status(StatusCodes.CREATED).json({ message: 'API from Controller: create new board' })
  } catch (error) { next(error) }
}

export const boardController = {
  createNewBoard
}
