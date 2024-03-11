import express from 'express'
import { uploadSingleImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handler'

export const mediasRouter = express.Router()

mediasRouter.post('/images', wrapAsync(uploadSingleImageController))
mediasRouter.post('/video', wrapAsync(uploadVideoController))
