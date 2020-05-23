require('dotenv').config()

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fallback = require('express-history-api-fallback')
const compression = require('compression')
const data = require('./data/data.json')
const app = express()
const root = path.resolve(__dirname, '../dist')
const port = process.env.PORT || 8000
app.use(compression())
app.use(bodyParser())
app.use(cookieParser())
app.get('/api/data', (req, res) => res.json(data))
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(root))
  app.use(fallback('index.html', { root }))
} else {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })
}
app.listen(port, () => console.log('Listening on port ' + port))