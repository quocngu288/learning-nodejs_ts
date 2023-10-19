import { ObjectId } from "mongodb"

interface RefreshToken {
    _id?: ObjectId
    token: string
    created_at?: Date
    user_id: ObjectId
}

export default class RefreshTokenSchema {
    _id?: ObjectId
    token: string
    created_at: Date
    user_id: ObjectId

    constructor ({_id, token, created_at, user_id}: RefreshToken) {
        const date = new Date()
        this._id = _id
        this.token = token
        this.created_at = created_at || date
        this.user_id = user_id
    }
}
