// modules
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const dbconnect = require('./db/dbconnection.js')
const dbinfo = require('./config/config.json')
// This is for the socket
// eslint-disable-next-line no-unused-vars
const models = require('./schemas/locationdata.js')
const mongoose = require('mongoose')
const find = require('./routes/geolocation.js')

// routes
const login = require('./routes/login.js')
const signup = require('./routes/signup.js')
const woocommerce = require('./routes/woocommerce.js')

// Connection to Mlbas!
dbconnect.connect(dbinfo)
const mysql = dbconnect.connectMysql(dbinfo)

// Setting up the port variable
var port = 12000
const portS = 60000

// setting express
var app = express()
app.set('port', port)
app.use('/static', express.static(path.join(__dirname, 'public')))

// The use of the bodyParser constructor (app.use(bodyParser());) has been deprecated
// Now is a middleware, so you have to call the methods separately...

app.use(bodyParser.json({ limit: '15mb' }))
app.use(bodyParser.urlencoded({ limit: '15mb', extended: true, parameterLimit: 50000 }))

// Allow CROSS-ORIGINS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'POST, GET, HEAD, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

// giving express access to routes
login(app)
signup(app)
woocommerce(app, mysql)

// start the server
app.listen(app.get('port'), function () {
  console.log('Express server () listening on localhost:' + app.get('port'))
})

// Starting socket.io for the Geolocation service
const server = http.createServer(app)
const io = socketIo(server)

// Setting up the Sockets

const nsp = io.of('/geolocationOrfood')

nsp.on('connection', function (socket) {
  socket.on('create', function (msg) {
    var data = JSON.parse(msg)
    var geolocation = mongoose.model('geolocation')
    var location = geolocation({ idOrder: data.order, idDeliveryMan: data.deliveryGuyId, lat: data.lat, long: data.lng })

    socket.join(data.order)
    location.save(function (err) {
      if (err != null) console.log(err)
    })
  })

  socket.on('join', function (msg) {
    var data = JSON.parse(msg)
    var geolocation = mongoose.model('geolocation')

    socket.join(data.order)

    find.findPosition(geolocation, data, socket)
  })

  socket.on('position', function (msg) {
    var data = JSON.parse(msg)
    var geolocation = mongoose.model('geolocation')
    geolocation.findOneAndUpdate({ idOrder: data.order }, { idOrder: data.order, idDeliveryMan: data.deliveryGuyId, lat: data.lat, long: data.lng }, function (err) {
      if (err) {
        console.log(err)
        socket.in(data.order).emit('newLocation', data)
      } else {
        socket.in(data.order).emit('newLocation', data)
      }
    })
  })

  socket.on('getPosition', function (msg) {
    var data = JSON.parse(msg)
    var geolocation = mongoose.model('geolocation')

    find.findPosition(geolocation, data, socket)
  })
})

server.listen(portS, () => console.log(`Socket listening on port ${portS}`))
