const mongoose = require('mongoose')
const models = require('../Schemas/users.js')
const hash = require('../auth/hashpass')
const jwt = require('../auth/jwtmodule')

// Giving express access to route.

module.exports = function (app) {
  app.post('/login', function (req, res) {
    var users = mongoose.model('users')
    var token = ''

    console.log(req.body.user + ' is trying to sign in')

    // We make a query to check if the data is right, then we send (or not) the token.
    users.countDocuments({ user: req.body.user, pass: hash.hashPassword(req.body.password) }, function (_err, count) {
      if (count === 1) {
        console.log('The user exists!')

        // eslint-disable-next-line no-inner-declarations
        function getData (id) {
          // eslint-disable-next-line no-undef
          var query = users.find({ user: id })
          return query
        };

        var query = getData(req.body.user)
        query.exec(function (err, user) {
          if (err) return console.log(err)
          else {
            console.log(user[0])
            token = jwt.createToken(user[0].user, user[0].rights)

            res.json({
              'response': 'You are now logged in.',
              'token': token,
              'user': user[0].user,
              'status': '200' })
          }
        })
      } else {
        console.log('Wrong user/pass')
        res.json({
          'response': 'Wrong user/pass!',
          'status': '418'
        })
      }
    })
  })
}
