require('dotenv').config()

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fallback = require('express-history-api-fallback')
const compression = require('compression')
const app = express()
const root = path.resolve(__dirname, '../dist')
const port = process.env.PORT || 8000
// const buildData = require('./data')
// const cron = require('node-cron')

let data = null 

;(async () => {
  // data = await buildData()
  app.use(compression())
  app.use(bodyParser())
  app.use(cookieParser())
  if (process.env.NODE_ENV === 'production') {
    // app.get('/api/data', (req, res) => res.json(data))
    app.use(express.static(root))
    app.use(fallback('index.html', { root })) 
  } else {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })
    // app.get('/api/data', (req, res) => res.json(data))
  }
  // cron.schedule('0 0 * * *', async () => {
  //   data = await buildData()
  // }, {
  //   scheduled: true,
  //   timezone: 'America/Los_Angeles'
  // })
  app.listen(port, () => console.log('Listening on port ' + port))
})() 