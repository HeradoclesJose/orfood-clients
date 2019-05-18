const mongoose = require('mongoose')

module.exports = {
  connect: (dbinfo) => {
    // Setting the DB's default connection (because the old way its still allowed, we need to use the new url parser manually to avoid some bugs)
    mongoose.connect(dbinfo.db.url, { useNewUrlParser: true, poolSize: 6, keepAlive: true, keepAliveInitialDelay: 300000 })
    var db = mongoose.connection
    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise
    // Getting the connection and binding it to error event
    db.on('error', console.error.bind(console, 'connection error:'))
    db.once('open', function () {
      console.log('Connected to MongoAtlas!')
    })
  }
}
