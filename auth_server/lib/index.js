const express = require('express'),
  chalk = require('chalk'),
  uuid = require('uuid/v4'),
  session = require("client-sessions"),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  db = require("./models"),
  path = require('path'),
  fs = require('fs')


require('dotenv').config({ path: '../../.env'})

var Spotify = require('node-spotify-api');

const app = express()
var token_hold = {}

var spotify = new Spotify({
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
});

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json()) 

app.use(session({
  secret: 'keyboard_dog',
  resave: false,
  saveUninitialized: true,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  genid: (req) => {
    console.log('inside the session middleware')
    console.log(req.sessionID)
    return uuid()
  }
}));

app.get('/stream', (req, res) => {
  const file = __dirname + '/../public/song.m4a'
  fs.exists(file, (exists) => {
    if (exists) {
      const rstream = fs.createReadStream(file);
      rstream.pipe(res);
    } else {
      res.send('Error - 404');
      res.end();
    }
  });
})

app.post('/new_score', async (req, res) => {
  const {score, playlist, username} = req.body
  const createdScore = await db.score.create({
    score,
    playlist,
    username
  })

  res.status = 200
  res.send(createdScore)
})

app.get('/playlist_highscore', async (req, res) => {
  const {playlist} = req.body
  const highscore_list = await db.score.find({playlist}).sort({score: -1}).limit(10)
  res.status = 200
  res.send(highscore_list)
})

app.get('/user_highscore', async (req, res) => {
  const {username, playlist} = req.body
  const highscore_list = await db.score.findOne({username, playlist}).sort({score: -1}).limit(1)
  res.status = 200
  res.send(highscore_list)
})


app.get('/callback', (req, res) => {
  res.sendFile(__dirname + '/callback.html')
  if (req.query.error) {
    console.log(chalk.red('Something went wrong. Error: '), req.query.error)
  }
})


app.get('/token', (req, res) => {
  res.sendStatus(200)
  const token = req.query.access_token
  if (token) {
    user_state = req.query.state[1]
    token_hold[user_state] = token
  }
})

app.get('/get_token/:state', async (req, res) => {
  try {
    // wait for the token to be generated by the parallel token access request
    const { state } = req.params
    await new Promise((resolve,reject) => {
      validation_count = 0
      var timer = setInterval(() => {
        if (typeof token_hold[req.params.state] !== 'undefined') {
          clearInterval(timer)
          resolve()
        }
        validation_count += 1
        if (validation_count > 20) reject()
      }, 5000)
    })

    // memory leak avoided by deleting token from the token_hold
    const token = token_hold[state]
    delete token_hold[state]

    res.send(token)
  } 
  catch(err) {
    res.status = 400
    res.send(null);
  }
})

app.get('/test_session', (req, res) => {
  res.status = 200
  res.send('good')
})


app.get('/', (req, res) => {
  res.send('good')
})

const main = () => {
  app.listen(process.env.PORT, () => {
    console.log('listening on port ' + process.env.PORT)
  })
}

module.exports = main
