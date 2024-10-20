/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'

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

export const boardService = {
  createNewBoard
}
