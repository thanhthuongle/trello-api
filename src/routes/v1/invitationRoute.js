import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express. Router()

Router.route('/board')
  .post(
    authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
  )

// get invitation by User
Router.route('/')
  .get( authMiddleware.isAuthorized, invitationController.getInvitations )

// Cập nhật một bản ghi board invitation
Router.route('/board/:invitationId')
  .put( authMiddleware.isAuthorized, invitationController.updateBoardInvitation )

export const invitationRoute = Router