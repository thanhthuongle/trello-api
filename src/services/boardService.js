/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNewBoard = async (boardData) => {
  try {
    const newBoard = {
      ...boardData,
      slug: slugify(boardData.title)
    }

    // Gọi đến modal để xử lý lưu bản ghi newBoard
    const createdBoard = await boardModel.createNewBoard(newBoard)
    // console.log('createdBoard:', createdBoard)

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log('getNewBoard: ', getNewBoard)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    // Gọi đến modal để xử lý lưu bản ghi newBoard
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found')
    }

    return board
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNewBoard,
  getDetails
}
