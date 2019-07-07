/* eslint-disable no-loop-func */
const moment = require('moment');
const isAuth = require('../auth/IsAuth.js');
const queries = require('../db/queries.json');

function response(res, status, messageValue) {
  return res.status(status).send({ message: messageValue });
}

function responseData(res, status, messageValue, dataValue) {
  return res.status(status).send({ message: messageValue, data: dataValue });
}

function getKeyNameMeta(key) {
  switch (key) {
    case 'foodbakery_transaction_amount': {
      return 'total';
    }
    case 'foodbakery_trans_first_name': {
      return 'name';
    }
    case 'foodbakery_trans_last_name': {
      return 'lastName';
    }
    case 'foodbakery_trans_phone_number': {
      return 'phone';
    }
    case 'foodbakery_trans_address': {
      return 'address';
    }
    case 'foodbakery_trans_email': {
      return 'email';
    }
    default: {
      break;
    }
  }
}

// isAuth.isAuthenticated
// Giving express access to route.
module.exports = (app, mysql) => {
  app.get('/restaurantes', isAuth.isAuthenticated, async (req, res) => {
    let restaurants = await mysql.query(queries.orders.selectRestaurants);

    if (restaurants.affectedRows === 0) {
      return responseData(res, 403, 'Restaurants Not Found ', []);
    }

    restaurants = restaurants.map((value, index, array) => {
      return { name: value.post_title };
    });

    return responseData(res, 200, 'Restaurants ', restaurants);
  });

  app.get('/pedidos', isAuth.isAuthenticated, async (req, res) => {
    const orders = await mysql.query(queries.orders.selectOrdersPosts);

    if (orders.affectedRows === 0) {
      return responseData(res, 500, 'Ordenes no encontradas ');
    }

    const ordersIds = orders.map((value, index, array) => {
      return [value.ID, value.post_date, value.post_status];
    });

    // console.log('ordersIds --------', ordersIds);

    const dataResult = [];
    for (let id = 0; id < ordersIds.length; id += 1) {
      let dataItem = {};

      // console.log('ordersId ', ordersIds);
      let meta = await mysql.query(
        queries.orders.selectOrdersMeta,
        ordersIds[id][0]
      );

      dataItem.orderDate = moment(ordersIds[id][1]).format('DD/MM/YYYY');
      dataItem.orderId = ordersIds[id][0];

      for (let metarcv = 0; metarcv < meta.length; metarcv += 1) {
        if (meta[metarcv].meta_key.indexOf('rcv') > -1) {
          // console.log('orderId ----------------', ordersIds[id][0]);
          // console.log(
          //   'meta ',
          //   meta[metarcv].meta_value.split(';')[1].split(':')[1]
          // );
          const metaId = meta[metarcv].meta_value.split(';')[1].split(':')[1];
          const foodbakery = await mysql.query(
            queries.orders.selectOrdersMeta,
            metaId
          );

          const metaKeys = [
            'foodbakery_transaction_amount',
            'foodbakery_trans_first_name',
            'foodbakery_trans_last_name',
            'foodbakery_trans_phone_number',
            'foodbakery_trans_address',
            'foodbakery_trans_email'
          ];
          for (let fb = 0; fb < foodbakery.length; fb += 1) {
            // console.log('meta_key ', foodbakery[fb].meta_key);
            if (metaKeys.includes(foodbakery[fb].meta_key)) {
              let key = foodbakery[fb].meta_key;
              // fbakery[key] = foodbakery[fb].meta_value;
              // bakeryMeta[fb] = fbakery;
              dataItem[getKeyNameMeta(key)] = foodbakery[fb].meta_value;
            }

            if (foodbakery[fb].meta_key === 'foodbakery_transaction_order_id') {
              let ordersInfo = await mysql.query(
                queries.orders.selectOrdersMeta,
                foodbakery[fb].meta_value
              );

              for (let oi = 0; oi < ordersInfo.length; oi += 1) {
                if (ordersInfo[oi].meta_key === 'menu_items_list') {
                  // console.log(
                  //   `${ordersInfo[oi].meta_key} ${
                  //     ordersInfo[oi].meta_value
                  //   }`.split(';')
                  // );
                  let items = ordersInfo[oi].meta_value
                    .split(';')
                    .map((value, index, array) => {
                      if (value.includes('title')) {
                        return `${array[index + 1].split(':')[1]};${
                          array[index + 1].split(':')[2]
                        };${array[index + 3].split(':')[2]}`;
                      }
                    });

                  let ordersDetails = [];
                  let ordersDetail = {};
                  for (let q = 0; q < items.length; q += 1) {
                    if (typeof items[q] !== 'undefined') {
                      ordersDetail.itemNumber = parseInt(
                        items[q].split(';')[0]
                      );
                      ordersDetail.description = items[q]
                        .split(';')[1]
                        .replace(/["]/g, '');
                      ordersDetail.price = parseFloat(
                        items[q].split(';')[2].replace(/["]/g, '')
                      );
                      ordersDetails.push(ordersDetail);
                      // console.log('item row ', ordersDetail);
                      ordersDetail = {};
                    }
                  }
                  // console.log('ordersDetails ', ordersDetails);
                  dataItem.orderDetails = ordersDetails;
                  ordersDetails = [];
                  // console.log(`items ${items}`);
                }
              }
            }
          }

          dataItem.clientName = `${dataItem.name} ${dataItem.lastName}`;
          delete dataItem.name;
          delete dataItem.lastName;
          console.log('dataItem *------ ', dataItem);

          if (meta[metarcv].meta_value.includes(req.permissions.restaurant)) {
            // dataItem.restaurant = req.permissions.restaurant;
            dataResult.push(dataItem);
          }
        }
      }
    }

    return responseData(res, 200, 'Pedidos Encontrados', dataResult);
    // if (req.permissions.restaurant === 'arepasantarita') {
    //   return response(res, 200, MockData);
    // }
    // return response(res, 418, 'No tienes pedidos actualmente');
  });
};
