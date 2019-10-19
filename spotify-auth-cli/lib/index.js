const express = require('express')
const chalk = require('chalk')
const session = require('client-sessions')
require('dotenv').config({ path: '../.env'})

var Spotify = require('node-spotify-api');

const app = express()
var token_hold = {}

var spotify = new Spotify({
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
});

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

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

    req.session.state = req.params.state
    req.session.token = token_hold[req.params.state]
    res.send(req.session.token)
  }
  catch {
    res.status = 400
    res.send(null);
  }
})


const main = () => {
  app.listen(process.env.PORT, () => {
    console.log('listening on port ' + process.env.PORT)
  })
}

module.exports = main
