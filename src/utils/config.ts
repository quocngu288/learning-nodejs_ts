import minimist from 'minimist'
import { config } from 'dotenv'

config()

const argv = minimist(process.argv.splice(2))
export const isProduction = Boolean(argv['production'])
