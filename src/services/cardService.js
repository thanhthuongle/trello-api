/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

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

export const cardService = {
  createNew
}
