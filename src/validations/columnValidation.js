import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const CorrectCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).required().trim().strict()
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
    // Chỉ update khi keo 2 column khác nhau khi cần
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(
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

export const columnValidation = {
  createNew,
  update
}
