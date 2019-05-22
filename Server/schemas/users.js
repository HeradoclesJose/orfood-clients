// We define the Schema

var mongoose = require('mongoose')

var Schema = mongoose.Schema({
  name: { type: String, required: true },
  user: { type: String, required: true, unique: true, dropDups: true },
  pass: { type: String, required: true }
}, { collection: 'Users' })

// We export the model
// eslint-disable-next-line no-unused-vars
var users = module.exports = mongoose.model('users', Schema)
