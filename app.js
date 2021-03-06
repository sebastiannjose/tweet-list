require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')

const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

app.use(cors({
  exposedHeaders: ['X-Pusher']
}))

app.use(express.static('public'))

app.get('/json', (req, res, next) =>
  redis
    .lrange( 'tweets', 0, -1 )
    .then( result => result.map( JSON.parse ) )
    .then( tweets => res.send( tweets ) )
    .catch( next )
)

// expose public channel config so we don't have to
// hardcode in our frontend
app.get('/config', (req, res) => {
  res.send({
    key: process.env.p_key,
    cluster: process.env.p_cluster,
    channel: process.env.p_channel
  })
})


// external endpoint (for other, unrelated demos)
app.get('/tweets', (req, res, next) => {
  redis
    .lrange( 'tweets', 0, -1 )
    .then( result => result.map( JSON.parse ) )
    .then( tweets => {
      res.set('X-Pusher', JSON.stringify({
        key: process.env.p_key,
        cluster: process.env.p_cluster,
        channel: process.env.p_channel,
        event: 'tweet'
      }))
      res.send( tweets )
    })
    .catch( next )
})

app.listen(process.env.PORT || 3000)
