/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'

const createNewBoard = async (boardData) => {
  try {
    const newBoard = {
      ...boardData,
      slug: slugify(boardData.title)
    }

    // Gọi đến modal để xử lý lưu bản ghi newBoard

    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNewBoard
}
