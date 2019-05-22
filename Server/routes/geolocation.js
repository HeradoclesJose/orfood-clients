module.exports.findPosition = (geolocation, data, socket) => {
  console.log('im being called')
  geolocation.find({ idOrder: data.order }, function (err, docs) {
    if (err) return err
    else {
      socket.in(data.order).emit('newLocation', docs)
    }
  })
  console.log(socket.adapter.rooms)
  console.log(data.order)
}
