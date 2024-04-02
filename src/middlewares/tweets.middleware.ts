import { checkSchema } from 'express-validator'
import { isEmpty, isObject } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'
import { tweetMessage } from '~/constants/messages'
import { changeObjectEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validator'

export const tweetRequestValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [changeObjectEnumToArray(TweetType)], //=> test thu truong hop ko co array
        errorMessage: tweetMessage.TYPE_INVALID
      }
    },
    audience: {
      isIn: {
        options: [changeObjectEnumToArray(TweetAudience)],
        errorMessage: tweetMessage.AUDIENCE_INVALID
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type
          if (
            [TweetType.ReTweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
            ObjectId.isValid(value) === false
          ) {
            throw new Error(tweetMessage.PARENT_ID_MUST_BE_A_OBJECT_ID)
          }
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(tweetMessage.PARENT_ID_MUST_BE_NULL)
          }
        }
      }
    },
    content: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type
          const mentions = req.body.mentions
          const hashtags = req.body.hashtags
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(tweetMessage.CONTENT_MUST_BE_A_NON_EMPLTY_SRING)
          }
          if (type == TweetType.ReTweet && value !== '') {
            throw new Error(tweetMessage.CONTENT_MUST_BE_A_EMPTY_STRING)
          }
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (value.some((item: any) => typeof item !== 'string')) {
            throw new Error(tweetMessage.HASHTAGS_MUST_BE_ARRAY_STRING)
          }
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(tweetMessage.MENTIONS_MUST_BE_ARRAY_OF_USER_ID)
          }
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yeu cau moi phan tu trong array la array MediaObject
          if (
            value.some((item: any) => {
              // url ko phai string va type ko nam trong MediaType thi retur error
              return typeof item.url !== 'string' && !changeObjectEnumToArray(MediaType).includes(item.type)
            })
          ) {
            throw new Error(tweetMessage.MEDIAS_MUST_BE_ARRAY_OF_MEDIA_OBJECT)
          }
        }
      }
    }
  })
)
