//GENERICS_TYPE
// interface LengthObj {
//     length: number
// }
// const logTest = <T extends LengthObj>(value: T) => {
//     console.log(value.length);
//     return value
// }

// const getValue = <Obj, Key extends keyof Obj>(obj: Obj, key: Key) => {
//     return obj[key]
// }

// getValue({name: 'Ngu', age: 20}, 'name')

import express, { NextFunction, Request, Response } from 'express'
import { config } from 'dotenv'
import bodyParser from 'body-parser'
import databaseService from './services/db.services'
import { mainRouter } from './routes/index.routes'
import { defaultErrorHandler } from './middlewares/error.middleware'
import { initFolderUploads } from './utils/file'
const app = express()

config()

initFolderUploads()

databaseService.connect()

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', mainRouter)

// xử lý "error handler"
app.use(defaultErrorHandler)

app.listen(process.env.PORT, () => console.log(`server is running on ${process.env.PORT}`))