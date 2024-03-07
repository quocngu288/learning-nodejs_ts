import express from 'express'
import { servingImageStaticContoller } from '~/controllers/medias.controllers'

export const staticRouter = express.Router()

staticRouter.get('/uploads/:name', servingImageStaticContoller)
