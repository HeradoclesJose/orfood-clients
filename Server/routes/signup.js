// We export the driver, models, etc...
const mongoose = require('mongoose')
// eslint-disable-next-line no-unused-vars
const models = require('../schemas/users')
const isAuth = require('../auth/IsAuth.js')
const hash = require('../auth/hashpass')

// Giving express access to route.
module.exports = function (app) {
  app.post('/signup', isAuth.isAuthenticated, function (req, res) {
    // We create the Document and recover the model.
    var users = mongoose.model('users')
    var user = users({ name: req.body.name, user: req.body.user, pass: hash.hashPassword(req.body.password) })

    user.save(function (err) {
      if (err) {
        console.log(err)
        return res.json({
          'response': 'ID is duplicated!',
          'status': 418
        })
      } else {
        return res.json({
          'response': 'User was created!',
          'status': 200
        })
      }
    })
  })
}
