/* eslint-disable no-useless-catch */
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (columnData) => {
  try {
    const newColumn = {
      ...columnData
    }

    // Gọi đến modal để xử lý lưu bản ghi newColumn
    const createdColumn = await columnModel.createNew(newColumn)
    // console.log('createdColumn:', createdColumn)

    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    // console.log('getNewColumn: ', getNewColumn)

    if (getNewColumn) {
      // xử lý cấu trúc data trước khi trả về
      getNewColumn.cards = []

      // đẩy id của column mới tạo vào cuối board
      await boardModel.pushColumnOderIds(getNewColumn)
    }

    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Gọi đến modal để xử lý lấy thông tin chi tiết của board
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    // xóa column
    await columnModel.deleteOneById(columnId)
    //xóa toàn bộ card thuộc column trên
    await cardModel.deleteManyByColumnId(columnId)
    // xóa columnId trong mảng columnOrderIds cảu cái board chứa nó
    await boardModel.pullColumnOderIds(targetColumn)

    return { deleteResult: 'Column and its card deleted successfully!' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}
