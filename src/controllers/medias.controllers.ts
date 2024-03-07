import { Request, Response } from 'express'
import path, { resolve } from 'path'
import mediasService from '~/services/medias.services'
import { uploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const rs = await mediasService.handleUploadSingleImage(req)
  console.log('rs', rs)

  return res.json({
    messase: 'Upload Success',
    path: rs
  })
}

export const servingImageStaticContoller = (req: Request, res: Response) => {
  const { name } = req.params
  console.log('name', name)

  return res.sendFile(path.resolve('uploads', name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not Found')
    }
  })
}
