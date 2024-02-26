import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import UserSchema from '~/models/schemas/users.schemas'
import RefreshTokenSchema from '~/models/schemas/refreshToken.schemas'
import FollowSchema from '~/models/schemas/follow.schemas'

config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusternick.qrlzcbl.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db('twiter-dev')
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      throw error
    }
  }

  get users(): Collection<UserSchema> {
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }

  get refreshTokens(): Collection<RefreshTokenSchema> {
    return this.db.collection(process.env.DB_COLLECTION_REFRESH_TOKENS as string)
  }

  get follows(): Collection<FollowSchema> {
    return this.db.collection(process.env.DB_COLLECTION_FOLLOWS as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
