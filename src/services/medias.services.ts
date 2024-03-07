import { Request } from 'express'
import { getFileName, uploadSingleImage } from '~/utils/file'
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
          .toFile(path.resolve('uploads', `${newName}.jpg`))
        unlinkSync(file.filepath)
        return isProduction
          ? `${process.env.HOST}/static/uploads/${newName}.jpg`
          : `http://localhost:${process.env.PORT}/api/static/uploads/${newName}.jpg`
      })
    )
    return {
      files: listFile,
      type: MediaType.Image
    }
  }
}
const mediasService = new MediasService()
export default mediasService
