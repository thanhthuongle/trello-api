/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const createNew = async (boardData) => {
  try {
    const newBoard = {
      ...boardData,
      slug: slugify(boardData.title)
    }

    // Gọi đến modal để xử lý lưu bản ghi newBoard
    const createdBoard = await boardModel.createNew(newBoard)
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

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Gọi đến modal để xử lý lấy thông tin chi tiết của board
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })

    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Successfully' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
    return results
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
