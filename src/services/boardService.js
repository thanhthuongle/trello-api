/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

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
    // Gọi đến modal để xử lý lấy thông tin chi tiết của board
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'board not found')
    }

    // dùng cloneDeep để sao chép board mà ko thay đổi đến nó nếu sau này có sửa đổi
    const resBoard = cloneDeep(board)
    // Đưa card về đúng column
    resBoard.columns.forEach(column => {
      // dùng toString của js
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())

      // dùng equals do mongodb hỗ trợ trên ObjectId
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })
    // xóa cards khỏi board ban đầu
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNewBoard,
  getDetails
}
