
import { env } from '~/config/environment'
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173' // Không cần localhost vì chúng ta đã luôn luôn cho phép môi trường dev vượt qua cors
  'https://trello-web-beta-three.vercel.app',
  'https://trello-web-su-gia-hoa-binhs-projects-a8f56a9c.vercel.app',
  'https://trello-web-git-master-su-gia-hoa-binhs-projects-a8f56a9c.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}
