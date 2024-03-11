import { Request } from 'express'
import { File } from 'formidable'
import { existsSync, mkdirSync } from 'fs'
import { DIR } from '~/constants/dir'

export const initFolderUploads = () => {
  const listFolderInit = [DIR.UPLOAD.IMAGES_TEMP, DIR.UPLOAD.VIDEOS_TEMP]
  listFolderInit.forEach((path) => {
    if (!existsSync(path)) {
      mkdirSync(path, {
        recursive: true // nếu có nested foler thì sẽ ko lỗi
      })
    }
  })
}

export const uploadSingleImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: DIR.UPLOAD.IMAGES_TEMP,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 4, // 300kb
    filter: ({ name, originalFilename, mimetype }) => {
      console.log('filter', { name, originalFilename, mimetype })
      const valid = Boolean(mimetype?.includes('image/'))
      console.log('vvalid', valid)
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      console.log('res', { fields, files })
      resolve(files.image as File[])
    })
  })
}

export const uploadVideos = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: DIR.UPLOAD.VIDEO,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50mb
    filter: ({ name, originalFilename, mimetype }) => {
      // console.log('filter', { name, originalFilename, mimetype })
      // const valid = Boolean(mimetype?.includes('image/'))
      // console.log('vvalid', valid)
      // if (!valid) {
      //   form.emit('error' as any, new Error('File type is not valid') as any)
      // }

      return true
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      console.log('res', { fields, files })
      resolve(files.video)
    })
  })
}

export const getFileName = (fileName: string) => {
  console.log('ssss', fileName)

  const name = fileName?.split('.')
  console.log('name', name)

  name.pop()
  return name.join('')
}
