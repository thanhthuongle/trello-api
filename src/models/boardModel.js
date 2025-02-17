import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'

// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),

  type: Joi.string().valid(BOARD_TYPES.PRIVATE, BOARD_TYPES.PUBLIC).required(),

  // Các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Những Admin của cái board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // Những thành viên của board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardtoAdd = {
      ...validData,
      ownerIds: [new ObjectId(String(userId))]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardtoAdd)
    return createdBoard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(String(id)) })
    return result
  } catch (error) { throw new Error(error) }
}

// sẽ dùng aggreate để lấy đầy đủ thông tin về board, card, column
const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(String(boardId)) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $lookup:{
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
        // $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } }
    ]).toArray()

    return result[0] || null
  } catch (error) { throw new Error(error) }
}

// push một giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) { throw new Error(error) }
}

const pullColumnOderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) { throw new Error(error) }
}

const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // chuẩn hóa kiểu dữ liệu với id trước khi lưu vào db
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(String(_id))))
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) { throw new Error(error) }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [
      // Điều kiện 01: Board chưa bị xóa
      { _destroy: false },
      // Điều kiện 02: Cái userId đang thực hiện request phải thuộc 1 trong 2 mảng ownerIds hoặc memberIds, sử dụng thuật toán $all của mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    // Xử lý query filter cho tunwgf truonwgf hopjw search boared, ví dụ search theo title
    if (queryFilters) {
      // console.log('🚀 ~ getBoards ~ queryFilters:', Object.keys(queryFilters))
      Object.keys(queryFilters).forEach(key => {
        // Có phân biệt chữ hoa chữ thường
        // queryConditions.push({ [key]: { $regex: queryFilters[key] } })

        // Không phân biệt chữ hoa chữ thường
        queryConditions.push({ [key]: { $regex: new RegExp(queryFilters[key], 'i') } })
      })
    }
    // console.log('🚀 ~ Object.keys ~ queryConditions:', queryConditions)

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường (theo chuẩn bảng mã ASCII)
        { $sort: { title: 1 } },
        // $facet để xử lý nhiều luồng trong 1 query
        { $facet: {
          // Luồng thứ nhất: Query Boards
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi của những page trước đó
            { $limit: itemsPerPage } // Giới hạn tối đa số lượng bản ghi trả về trên một page
          ],

          // Luồng thứ hai: Query đếm tổng số lượng bản ghi boards trong DB và trả về vào biến countedAllBoards
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        } }
      ],
      // Khai báo thêm thuộc tính collation locale 'en' để fix vụ B hoa và a thường ở trên
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) { throw new Error(error) }
}

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $push: { memberIds: new ObjectId(String(userId)) } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) { throw new Error(error) }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOderIds,
  pullColumnOderIds,
  update,
  getBoards,
  pushMemberIds
}
