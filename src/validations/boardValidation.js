import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const CorrectCondition = Joi.object({
    title: Joi.string().min(3).max(50).required().trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title length must be at least 3 characters long',
      'string.max': 'Title length must be less than or equal to 5 characters long',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().min(3).max(256).required().trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PRIVATE, BOARD_TYPES.PUBLIC).required()
  })

  try {
    // console.log('req:', req.body)
    await CorrectCondition.validateAsync(req.body, { abortEarly: false })
    // chuyển tiếp cho controller sau khi validation dữ liệu xong
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const CorrectCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PRIVATE, BOARD_TYPES.PUBLIC),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([])
  })

  try {
    // console.log('req:', req.body)
    await CorrectCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    // chuyển tiếp cho controller sau khi validation dữ liệu xong
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  const CorrectCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    // console.log('req:', req.body)
    await CorrectCondition.validateAsync(req.body, { abortEarly: false })
    // chuyển tiếp cho controller sau khi validation dữ liệu xong
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
}
