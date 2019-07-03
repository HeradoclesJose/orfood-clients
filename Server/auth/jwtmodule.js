// services.js
const jwt = require('jwt-simple')
const moment = require('moment')
const config = require('./../config/config.json')

module.exports.createToken = function (user, permissions) {
  var payload = {
    sub: user,
    permissions: permissions,
    iat: moment().unix(),
    exp: moment().add(1, 'days').unix()
  }

  return jwt.encode(payload, config.secret.token)
}
