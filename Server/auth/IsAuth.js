// IsAuth.js
var jwt = require('jwt-simple')
var moment = require('moment')
var config = require('./../config/config.json')

function reqError (res, status, message) {
  return res
    .status(status)
    .send({ message: message })
}

exports.isAuthenticated = function (req, res, next) {
  if (!req.headers.authorization) {
    reqError(res, 403, 'Tu petición no tiene cabecera de autorización')
  }

  try {
    var token = req.headers.authorization.split(' ')[1]
    var payload = jwt.decode(token, config.secret.token)

    if (payload.exp <= moment().unix()) {
      reqError(res, 403, 'El token ha expirado')
    }

    if (payload.permissions.level === 'admin') next()
    else if ((req.path === '/qrcreate' || '/pedidos' || '/reportes') & (payload.permissions.level === 'manager')) next()
    else reqError(res, 403, 'No tienes permisos para ver esto')
  } catch (err) {
    console.log(err)
    reqError(res, 403, 'Se ha anulado tu peticion por motivos de seguridad')
  }
}
