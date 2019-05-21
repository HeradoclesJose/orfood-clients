// We define the Schema

var mongoose = require('mongoose')

var Schema = mongoose.Schema({
  idDeliveryMan: { type: String, required: true },
  idOrder: { type: String, required: true },
  lat: { type: String, required: true },
  long: { type: String, required: true }
}, { collection: 'Users' })

// We export the model
// eslint-disable-next-line no-unused-vars
var geolocation = module.exports = mongoose.model('geolocation', Schema)
