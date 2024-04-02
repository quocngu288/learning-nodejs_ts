import express from 'express'
import { tweetController } from '~/controllers/tweets.controllers'
import { tweetRequestValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'

import { wrapAsync } from '~/utils/handler'

export const tweetRouter = express.Router()

tweetRouter.post('/', accessTokenValidator, verifyUserValidator, tweetRequestValidator, wrapAsync(tweetController))
