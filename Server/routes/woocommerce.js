const isAuth = require('../auth/IsAuth.js');
const queries = require('../db/queries.json');

module.exports = (app, mysql) => {
  app.post('/update-wc-status', isAuth.isAuthenticated, async (req, res) => {
    console.log('req ', req.body.wcStatus, req.body.orderId);
    if (!req.body.wcStatus || !req.body.orderId) {
      return res
        .status(500)
        .send({ message: 'Estado o numero de orden no han sido ingresados' });
    }

    const compare = ['sending', 'cook', 'finished'];

    // eslint-disable-next-line eqeqeq
    if (compare.indexOf(req.body.wcStatus) == -1) {
      return res.status(500).send({ message: 'Estado no valido' });
    }

    const date = new Date();

    const selectRCV = await mysql.query(queries.woocommerce.selectPostMetaRCV, [req.body.orderId]);
    

    const rcvId = selectRCV[0].meta_value.split(';')[1].split(':')[1];
    console.log('rcvId ', rcvId);
    

    const idFoodBakery = await mysql.query(queries.woocommerce.selectPostMetaFoodBakeryFirst,[rcvId])
    console.log('idFoodBakery ', idFoodBakery);

    let statusFoodBakery = "";
    switch (req.body.wcStatus){
      case 'sending' : {
        statusFoodBakery = 'Enviando';
        break;
      }
      case 'cook' : {
        statusFoodBakery = 'Cocinando';
        break;
      }
      case 'finished' : {
        statusFoodBakery = 'Completado';
        break;
      }

    }

    const updateFoodBakeryStatus = await mysql.query(queries.woocommerce.updateFoodBakeryStatus, [statusFoodBakery, idFoodBakery[0].meta_value]);
    console.log('update status foodbakery ', updateFoodBakeryStatus);
    if (updateFoodBakeryStatus.affectedRows === 0) {
      return res.status(500).send({
        message: 'Error actualizando la base de datos, foodbakery meta no encontrado'
      });
    }
    req.body.wcStatus = `wc-${req.body.wcStatus}`;
    const updatePromise = await mysql.query(queries.woocommerce.update, [
      req.body.wcStatus,
      date,
      date,
      req.body.orderId
    ]);

    


    if (updatePromise.affectedRows === 0) {
      return res.status(500).send({
        message: 'Error actualizando la base de datos, orden no encontrada'
      });
    }

    return res
      .status(200)
      .send({ message: 'Orden actualizada', data: updatePromise });

    // mysql.query(queries.woocommerce.update, [req.body.wcStatus, date, date, req.body.orderId], (err, orders, fields) => {
    //   if (err) {
    //     return res
    //       .status(500)
    //       .send({ message: 'Error actualizando la base de datos' })
    //   }
    //   return res
    //     .status(200)
    //     .send({ message: 'Orden actualizada',
    //       'data': orders })
    // })
  });
};
