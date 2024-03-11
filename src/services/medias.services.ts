import { Request } from 'express'
import { getFileName, uploadSingleImage, uploadVideos } from '~/utils/file'
import sharp from 'sharp'
import path from 'path'
import { unlinkSync } from 'fs'
import { isProduction } from '~/utils/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'

config()

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const files = await uploadSingleImage(req)
    const listFile = await Promise.all(
      files.map(async (file) => {
        const newName = getFileName(file.newFilename)
        await sharp(file.filepath)
          .jpeg()
          .toFile(path.resolve('uploads/images', `${newName}.jpg`))
        unlinkSync(file.filepath)
        return isProduction
          ? `${process.env.HOST}/static/uploads/images/${newName}.jpg`
          : `http://localhost:${process.env.PORT}/api/static/uploads/images/${newName}.jpg`
      })
    )
    return {
      files: listFile,
      type: MediaType.Image
    }
  }

  async handleUploadVideo(req: Request) {
    const file: any = await uploadVideos(req)
    console.log('file', file)

    const newName = getFileName(file[0].newFilename)
    // await sharp(file.filepath)
    //   .jpeg()
    //   .toFile(path.resolve('uploads', `${newName}.jpg`))
    // unlinkSync(file.filepath)
    const result = isProduction
      ? `${process.env.HOST}/static/uploads/videos/${newName}.mp4`
      : `http://localhost:${process.env.PORT}/api/static/uploads/videos/${newName}.mp4`
    return {
      files: result,
      type: MediaType.Video
    }
  }
}
const mediasService = new MediasService()
export default mediasService
