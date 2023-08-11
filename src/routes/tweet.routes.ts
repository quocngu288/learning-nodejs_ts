import express from 'express'

export const tweetRouter = express.Router()

tweetRouter.get('', (req, res) => {
    res.json({
        data: [
            {
                name: 'Ngu',
                age: 20
            }
        ]
    })
})

tweetRouter.use('/tweet', tweetRouter)