import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)

    const createdColumn = await columnService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const columnId = req.params.id
    const updatedBoard = await columnService.update(columnId, req.body)

    res.status(StatusCodes.CREATED).json(updatedBoard)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const columnId = req.params.id
    const result = await columnService.deleteItem(columnId)

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

export const columnController = {
  createNew,
  update,
  deleteItem
}
