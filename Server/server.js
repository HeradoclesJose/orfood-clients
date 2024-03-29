// modules
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dbconnect = require('./db/dbconnection.js');
const dbinfo = require('./config/config.json');
// This is for the socket
// eslint-disable-next-line no-unused-vars
const models = require('./schemas/locationdata.js');
const mongoose = require('mongoose');
const find = require('./routes/geolocation.js');

// routes
const login = require('./routes/login.js');
const signup = require('./routes/signup.js');
const woocommerce = require('./routes/woocommerce.js');
const qrcode = require('./routes/qrcodes.js');
const pedidos = require('./routes/pedidos.js');

// Connection to Mlbas!
dbconnect.connect(dbinfo);
const mysql = dbconnect.connectMysql(dbinfo);

// Keep Alive
setInterval(() => {
  mysql.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
    if (error) throw error;
  });
}, 1500000);

// Setting up the port variable
const port = 12000;
const portS = 60000;

// setting express
const app = express();
app.set('port', port);
app.use(express.static(path.join(__dirname, 'public')));

// The use of the bodyParser constructor (app.use(bodyParser());) has been deprecated
// Now is a middleware, so you have to call the methods separately...

app.use(bodyParser.json({ limit: '15mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '15mb',
    extended: true,
    parameterLimit: 50000
  })
);

// Allow CROSS-ORIGINS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'POST, GET, HEAD, PUT, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

// giving express access to routes
login(app);
signup(app);
woocommerce(app, mysql);
qrcode(app);
pedidos(app, mysql);

// start the server
app.listen(app.get('port'), () => {
  console.log(`Express server () listening on localhost:${app.get('port')}`);
});

// ssl settings

var fs = require('fs');
var https = require('https');

var options = { 
    key: fs.readFileSync('/etc/letsencrypt/live/orfood.es/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/orfood.es/fullchain.pem'),
  }

// Starting socket.io for the Geolocation service
const server = https.createServer(options, app);
const io = socketIo(server);


// Setting up the Sockets

io.on('connection', socket => {
  socket.on('create', msg => {
    const data = JSON.parse(msg);
    const geolocation = mongoose.model('geolocation');
    const location = geolocation({
      idOrder: data.order,
      idDeliveryMan: data.deliveryGuyId,
      lat: data.lat,
      long: data.lng
    });

    socket.join(data.order);
    location.save(err => {
      if (err) {
      }
    });
  });

  socket.on('join', msg => {
    const data = JSON.parse(msg);
    const geolocation = mongoose.model('geolocation');

    socket.join(data.order);

    find.findPosition(geolocation, data, socket);
  });

  socket.on('position', msg => {
    const data = JSON.parse(msg);
    const geolocation = mongoose.model('geolocation');
    geolocation.findOneAndUpdate(
      { idOrder: data.order },
      {
        idOrder: data.order,
        idDeliveryMan: data.deliveryGuyId,
        lat: data.lat,
        long: data.lng
      },
      function(err) {
        if (err) {
          console.log(err);
          socket.in(data.order).emit('newLocation', data);
        } else {
          socket.in(data.order).emit('newLocation', data);
        }
      }
    );
  });

  socket.on('getPosition', msg => {
    const data = JSON.parse(msg);
    const geolocation = mongoose.model('geolocation');

    find.findPosition(geolocation, data, socket);
  });
});

server.listen(portS, () => console.log(`Socket listening on port ${portS}`));
