// modules
const express = require('express')
const bodyParser = require('body-parser')
const dbconnect = require('./db/dbconnection.js')
const dbinfo = require('./config/config.json')
const path = require('path')

// Connection to Mlbas!
dbconnect.connect(dbinfo)

// setting express
var app = express()
app.set('port', process.env.PORT || 9390)
app.use('/static', express.static(path.join(__dirname, 'public')))

// The use of the bodyParser constructor (app.use(bodyParser());) has been deprecated
// Now is a middleware, so you have to call the methods separately...

app.use(bodyParser.json({ limit: '15mb' }))
app.use(bodyParser.urlencoded({ limit: '15mb', extended: true, parameterLimit: 50000 }))

// Allow CROSS-ORIGINS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// routes

const signup = require('./routes/signup')
const login = require('./routes/login')

// giving express access to routes
signup(app)
login(app)

// start the server
app.listen(app.get('port'), function () {
  console.log('Express server () listening on localhost:' + app.get('port'))
})
