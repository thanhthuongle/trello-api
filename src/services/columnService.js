/* eslint-disable no-useless-catch */
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'

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

export const columnService = {
  createNew,
  update
}
