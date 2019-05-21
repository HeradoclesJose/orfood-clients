// We export the driver, models, etc...
const mongoose = require('mongoose')
const models = require('../schemas/users')
const isAuth = require('../auth/IsAuth.js')
const hash = require('../auth/hashpass')

// Giving express access to route.
module.exports = function (app) {
  app.post('/signup', isAuth.isAuthenticated, function (req, res) {
    // We create the Document and recover the model.
    var users = mongoose.model('users')
    var user = users({ name: req.body.name, user: req.body.user, pass: hash.hashPassword(req.body.password) })

    // We send it to the database, but first we validate the data.
    users.countDocuments({ user: req.body.user }, function (err, count) {
      if (err) return console.error(err)
      else {
        if (count >= 1) {
          console.log('Username already exist!')
          return res.json({
            'response': 'User already exists',
            'status': 418
          })
        } else {
          user.save(function (err) {
            if (err) return console.error(err)
            else {
              console.log('Done')
              return res.json({
                'response': 'User was created!',
                'status': 200
              })
            }
          })
        }
      }
    })
  })
}
