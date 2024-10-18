import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'


// Khởi tạo một đối tượng TrelloDatabaseInstance ban đầu là null (Vì chưa connect)
let TrelloDatabaseInstance = null

// Khởi tạo một đối tượng MongoClientInstance để connect đến mongodb
const MongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối đến db
export const CONNECT_DB = async () => {
  // Gọi kế nối đến MongoDB Atlas
  await MongoClientInstance.connect()

  // Kết nối thành công thì lấy db theo tên và gán ngược lại cho TrelloDatabaseInstance
  TrelloDatabaseInstance = MongoClientInstance.db(env.DATABASE_NAME)
}

// export TrelloDatabaseInstance sau khi đã connect thành công - có thể dùng ở nhiều nơi
// đương nhiên: cần kết nối đến db trước khi gọi hàm này
export const GET_DB = () => {
  if (!TrelloDatabaseInstance) throw new Error('Phải kết nối tới DB trước!!!')
  return TrelloDatabaseInstance
}

// đóng kết nối db
export const CLOSE_DB = async () => {
  await MongoClientInstance.close()
}