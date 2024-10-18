import { StatusCodes } from 'http-status-codes'

const createNewBoard = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)
    res.status(StatusCodes.CREATED).json({ message: 'API from Controller: create new board' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: error.message })
  }
}

export const boardController = {
  createNewBoard
}
