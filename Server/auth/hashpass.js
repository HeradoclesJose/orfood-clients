const bcrypt = require('bcrypt-nodejs')
const config = require('../config/config.json')

module.exports.hashPassword = (password) => {
  var hash = bcrypt.hashSync(password, config.hashpassword.salt)
  return hash
}

module.exports.compareHash = (password, hash) => {
  var compare = bcrypt.compareSync(password, hash)
  return compare
}
