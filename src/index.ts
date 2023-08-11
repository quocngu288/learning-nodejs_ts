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

import express from 'express'
import { config } from 'dotenv'
import databaseService from './services/db.services'
import { mainRouter } from './routes/index.routes'
const app = express()
config()
// const router = express.Router()

app.use('/api', mainRouter)

databaseService.connect()

app.listen(process.env.PORT, () => console.log('server is running'))