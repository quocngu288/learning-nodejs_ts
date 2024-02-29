import { Request, Response } from 'express'
import path, { resolve } from 'path'
import { uploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
    const data = await uploadSingleImage(req)

    return res.json({
        messase: 'Upload Success'
    })
}