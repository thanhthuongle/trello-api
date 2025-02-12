/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),

      username: nameFromEmail,
      displayName: nameFromEmail, // Mặc định giống userName khi user đăng ký, về sau làm tính năng update cho user

      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào database
    // Gọi đến modal để xử lý lưu bản ghi newBoard
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello Sugiahoabinh: hãy xác nhận email của bạn trước khi sử dụng dịch vụ của chúng tôi'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> --- Sugiahoabinh ---</h3>
    `

    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // trả về dữ liệu cho phía controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    // Kiểm tra account trong database đã có chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) { throw new ApiError(StatusCodes.NOT_FOUND, 'Account not Found!') }
    if (existUser.isActive) { throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Account is already active!') }
    if (reqBody.token !== existUser.verifyToken) { throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!') }

    // Nếu mọi thứ oke thì cập nhật lại thông tin user để verify tài khoản
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updateUser = await userModel.update(existUser._id, updateData)

    return pickUser(updateUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    // Kiểm tra account trong database đã có chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) { throw new ApiError(StatusCodes.NOT_FOUND, 'Account not Found!') }
    if (!existUser.isActive) { throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Account is not active!') }
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      { throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!') }
    }

    /** Nếu mọi thứ - ok thì bắt đầu tạo - Tokens - đăng nhập - để trả về cho phía - FE */
    // Tạo thông tin để đính kèm trong JWT Token bao gồm_id và email của user
    const userInfo = { _id: existUser._id, email: existUser.email }

    // Tạo ra 2 loại token, accessToken-và-refreshToken- để trả về cho phía - FE
    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, 5)
    const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, 15)

    // Trả về thông tin của user kèm theo 2 cái token - vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken (
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      5
    )

    return { accessToken }
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
}
