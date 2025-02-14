/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (cardData) => {
  try {
    const newCard = {
      ...cardData
    }

    // Gọi đến modal để xử lý lưu bản ghi newCard
    const createdCard = await cardModel.createNew(newCard)
    // console.log('createdCard:', createdCard)

    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    // console.log('getNewCard: ', getNewCard)

    if (getNewCard) {
      // cập nhật mảng cardOrderIds sau khi tạo card mới
      await columnModel.pushCardOderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers') // folder: card-covers
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else {
      // Các trường hợp update các thông tin chung, ví dụ như title, décriptionn
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
