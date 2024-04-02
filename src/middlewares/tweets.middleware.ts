import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validator'

export const tweetRequestValidator = validate(checkSchema({}))
