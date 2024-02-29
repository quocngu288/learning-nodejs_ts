import express from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handler'

export const mediasRouter = express.Router()

mediasRouter.post('/', wrapAsync(uploadSingleImageController))