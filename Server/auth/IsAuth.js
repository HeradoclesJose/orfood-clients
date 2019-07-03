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

    if (payload.perpermissions.level === 'admin') {
      next()
    } else if (payload.perpermissions.level === 'manager') {
      // eslint-disable-next-line no-constant-condition
      if (req.path === '/qrcreate' || '/pedidos' || '/update-wc-status' || '/reportes') {
        next()
      } else {
        reqError(res, 403, 'No tienes permisos para ver esto')
      }
    } else if (payload.perpermissions.level === 'delivery') {
      // eslint-disable-next-line no-constant-condition
      if (req.path === '/update-wc-status') {
        next()
      } else {
        reqError(res, 403, 'No tienes permisos para ver esto')
      }
    } else {
      reqError(res, 403, 'Existe un problema con su solicitud, contacta al soporte tecnico')
    }
  } catch (err) {
    reqError(res, 403, 'Se ha anulado tu peticion por motivos de seguridad')
  }
}
