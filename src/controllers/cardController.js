import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)

    const createdCard = await cardService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew
}
