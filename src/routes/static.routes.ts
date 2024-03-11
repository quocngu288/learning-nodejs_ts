import express from 'express'
import { servingImageStaticContoller, servingVideosContoller } from '~/controllers/medias.controllers'

export const staticRouter = express.Router()

staticRouter.get('/uploads/images/:name', servingImageStaticContoller)
staticRouter.get('/uploads/videos/:name', servingVideosContoller)
