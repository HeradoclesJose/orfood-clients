// IsAuth.js
var jwt = require('jwt-simple')
var moment = require('moment')
var config = require('./../config/config.json')

exports.isAuthenticated = function (req, res, next) {
  if (!req.headers.authorization) {
    return res
      .status(403)
      .send({ message: 'Tu petición no tiene cabecera de autorización' })
  }

  try {
    var token = req.headers.authorization.split(' ')[1]
    var payload = jwt.decode(token, config.secret.token)

    if (payload.exp <= moment().unix()) {
      return res
        .status(403)
        .send({ message: 'El token ha expirado' })
    }

    req.user = payload.sub
    req.rights = payload.rights
    next()
  } catch (err) {
    return res
      .status(403)
      .send({ message: 'Se ha anulado tu peticion por motivos de seguridad' })
  }
}
