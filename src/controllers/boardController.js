import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNewBoard = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)

    const createBoard = await boardService.createNewBoard(req.body)

    res.status(StatusCodes.CREATED).json(createBoard)
  } catch (error) { next(error) }
}

export const boardController = {
  createNewBoard
}
