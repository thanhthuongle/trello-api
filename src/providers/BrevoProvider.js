const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'

// cấu hình brevo: https://github.com/getbrevo/brevo-node
let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  // Cấu hình nội dùng gửi mail
  let sendSmtpEmail = new brevo.SendSmtpEmail()
  sendSmtpEmail.sender = { 'name': env.ADMIN_EMAIL_NAME, 'email': env.ADMIN_EMAIL_ADDRESS }
  sendSmtpEmail.to = [{ 'email': recipientEmail }]
  sendSmtpEmail.subject = customSubject
  sendSmtpEmail.htmlContent = htmlContent

  // Gọi hành động gửi mail
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
