module.exports.findPosition = (geolocation, data, socket) => {
  geolocation.find({ idOrder: data.order }, function (err, docs) {
    if (err) return err
    else {
      socket.in(data.order).emit('newLocation', docs)
    }
  })
}
