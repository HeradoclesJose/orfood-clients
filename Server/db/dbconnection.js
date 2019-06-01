const mongoose = require('mongoose')
const mysql = require('mysql')

module.exports = {
  connect: (dbinfo) => {
    // Setting the DB's default connection (because the old way its still allowed, we need to use the new url parser manually to avoid some bugs)
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)
    mongoose.connect(dbinfo.db.url, { useNewUrlParser: true, poolSize: 6, keepAlive: true, keepAliveInitialDelay: 300000 })
    var db = mongoose.connection
    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise
    // Getting the connection and binding it to error event
    db.on('error', console.error.bind(console, 'connection error:'))
    db.once('open', function () {
      console.log('Connected to MongoAtlas!')
    })
  },
  connectMysql:(dbinfo) =>{
    let options ={
      'user':dbinfo.db.mysqlUser,
      'password':dbinfo.db.mysqlPassword,
      'database':dbinfo.db.mysqlDatabase,
      'host':dbinfo.db.mysqlHost,
      'port':dbinfo.db.mysqlPort,
      'connectionLimit': 10
    }

    const connection = mysql.createPool(options)
    connection.getConnection(err => {
      if (err) {
        console.error('Error connecting to Mysql Database')
        throw err
      }
    })

   

    console.log('Connected to WordpressDB')
    return connection;

  }
}
