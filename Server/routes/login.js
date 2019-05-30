const mongoose = require('mongoose')
// eslint-disable-next-line no-unused-vars
const models = require('../schemas/users.js')
const hash = require('../auth/hashpass')
const jwt = require('../auth/jwtmodule')
// Giving express access to route.

module.exports = function (app) {
  app.post('/login', function (req, res) {
    var users = mongoose.model('users')
    var token = ''

    // We make a query to check if the data is right, then we send (or not) the token.
    users.countDocuments({ user: req.body.user, pass: hash.hashPassword(req.body.password) }, function (_err, count) {
      if (count === 1) {
        token = jwt.createToken(req.body.user)

        res.json({
          'response': 'You are now logged in.',
          'token': token,
          'user': req.body.user,
          'status': '200' })
      } else {
        res.json({
          'response': 'Wrong user/pass!',
          'status': '418'
        })
      }
    })
  })
}
