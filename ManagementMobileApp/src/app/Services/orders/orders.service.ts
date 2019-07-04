import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';

// Models
import {BASE_URL, MAIN_PORT} from '../../API/BaseUrl';
import { Order } from '../../Interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private ordersInDeliveryUrl: string = BASE_URL + MAIN_PORT + '/pedidos';
  private ordersDoneUrl: string = BASE_URL + '/delivery/done';

  constructor(private http: HTTP, private storage: Storage) { }

  getOrdersInDelivery(): Promise<any> {
    return new Promise((res, rej) => {
        this.storage.get('token')
            .then((token) => {
                const headers: any = {
                    Authorization: 'Bearer ' + token
                };
                let orders: Array<Order> = [];
                this.http.get(this.ordersInDeliveryUrl, {}, headers)
                    .then((data) => {
                        const ordersJson = JSON.parse(data.data);
                        orders = ordersJson.message;
                        // Falta calcular el total
                        res(orders);
                    })
                    .catch((err) => {
                        rej(err);
                    });
            });
    });
  }

  parseOrderDetails(orderDetailsString: string): Array<{description: string, price:number}> {
      const orderDetails = [];
      const details: Array<string> = orderDetailsString.split('|&&|');
      details.forEach((detail) => {
          const detailElements = detail.split('|,,|');
         // Actually there is only 2 fields in the detail
          const detailJson = {
              description: detailElements[0],
              price: detailElements[1]
          };
          orderDetails.push(detailJson);
      });
      console.log('out', orderDetails);
      return orderDetails;
  }


  stringifyOrderDetails (orderDetails: Array<{description: string, price:number}>): string {
      let orderDetailString = '';
      orderDetails.forEach((detail) => {
          orderDetailString = orderDetailString + detail.description + '|,,|' + detail.price + '|&&|';
      });
      orderDetailString = orderDetailString.substr(0, orderDetailString.length-4);
      return orderDetailString;
  }

  // Lets Wait for version 1.1
/*
  getDeliveredOrders(): Promise<any> {
    return new Promise((res, rej) => {
      this.http.get('https://httpbin.org/get', {}, {})
          .then((data: any) => {
              const orders: Array<any> = [];
              for (let i = 0; i < 25; i++) {
                  const orderData = {
                      id: i,
                      description: 'Tiger Roll Tempura',
                      price: '10€'
                  };
                  orders.push(orderData);
                  res(orders);
              }
          })
          .catch((err) => {
            rej(err);
          })
    });
  }*/
}
