import { MediaType } from 'express'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'

export type TweetRequestBody = {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
}
interface Media {
  url: string
  type: MediaType
}
