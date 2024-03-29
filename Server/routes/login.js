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
	  //pass:hash.hashPassword(req.body.password)
    users.find({ user: req.body.user, pass:hash.hashPassword(req.body.password)}, function (_err, docs) {
      if (docs[0] !== undefined) {
        token = jwt.createToken(docs[0].user, docs[0].permissions)
console.log('docs ' , docs)
        res.json({
          'response': 'You are now logged in.',
          'token': token,
          'user': docs[0].user,
          'permissions': docs[0].permissions,
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
