import { Request } from "express"
import { existsSync, mkdirSync } from "fs"
import path from "path"

export const initFolderUploads = () => {
  if(!existsSync(path.resolve('uploads'))){
    mkdirSync(path.resolve('uploads'), {
        recursive: true // nếu có nested foler thì sẽ ko lỗi
    })
  } 
}

export const uploadSingleImage = async (req: Request) =>{
    const formidable = (await import('formidable')).default
    const form = formidable({
        uploadDir: path.resolve('uploads'),
        maxFiles: 1,
        keepExtensions: true,
        maxFileSize: 300 * 1024 // 300kb
    })

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err) 
            }
            console.log('res', {fields, files});
             resolve(files)
        })
    })
}