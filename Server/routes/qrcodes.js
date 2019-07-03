
const isAuth = require('../auth/IsAuth.js')
const fs = require('fs')
const qr = require('qr-image')

// Giving express access to route.
module.exports = function (app) {
  app.post('/qrcreate', isAuth.isAuthenticated, function (req, res, next) {
    // Get the text to generate QR code

    console.log(req.body)
    let qrTxt = JSON.stringify(req.body)

    // Generate QR Code from text
    var qrPng = qr.imageSync(qrTxt, { type: 'png' })
    // Generate a random file name
    let qrCodeFileName = req.body.order + '.png'

    fs.writeFileSync('./public/qrcodes/' + qrCodeFileName, qrPng, (err) => {
      console.log('done')
      if (err) {
        res.json({
          'response': 'Hubo un error con tu solicitud, intentalo de nuevo.',
          'status': '418' })
        return err
      }
    })

    res.json({
      'qrLink': 'qrcodes/' + qrCodeFileName,
      'status': '200' })
  })
}
