const isAuth = require('../auth/IsAuth.js')

var MockData = [
  {
    'orderId': 4564,
    'clientName': 'Carlos Montes',
    'orderDate': '09/05/2025',
    'direction': 'Calle 7 avenida 8',
    'orderDetails': [
      { 'description': 'Pizza de mariscos', 'price': 14 }, { 'description': 'Salsa de almejas', 'price': 15 }]
  },
  {
    'orderId': 4878,
    'clientName': 'Freddy Montoro',
    'orderDate': '08/05/2025',
    'direction': 'Calle 8 avenida 9',
    'orderDetails': [
      { 'description': 'Caviar con queso', 'price': 99 }]
  },
  {
    'orderId': 4000,
    'clientName': 'Caterin Echizen',
    'orderDate': '07/05/2025',
    'direction': 'Calle 10 avenida 11',
    'orderDetails': [
      { 'description': 'Arepa llanera', 'price': 5 }, { 'description': 'Hamburguesa sin carne', 'price': 2 }, { 'description': 'Paella', 'price': 25 }, { 'description': 'Sushi', 'price': 6 }]
  },
  {
    'orderId': 4512,
    'clientName': 'Jose Andres',
    'orderDate': '06/05/2025',
    'direction': 'Calle 11 Avenida 12',
    'orderDetails': [
      { 'description': 'Tortilla de patatas', 'price': 9 }, { 'description': 'Vino', 'price': 5 }, { 'description': 'Agua', 'price': 2 }]
  },
  {
    'orderId': 4530,
    'clientName': 'Heradocles Montero',
    'orderDate': '05/05/2025',
    'direction': 'Calle 12 avenida 13',
    'orderDetails': [
      { 'description': 'Combo familiar', 'price': 100 }]
  }
]

// Giving express access to route.
module.exports = function (app) {
  app.get('/pedidos', isAuth.isAuthenticated, function (req, res) {
    if (req.permissions.restaurant === 'arepasantarita') {
      return res
        .status(200)
        .send({ message: MockData })
    } else {
      return res
        .status(418)
        .send({ message: 'No tienes pedidos actualmente' })
    }
  })
}
