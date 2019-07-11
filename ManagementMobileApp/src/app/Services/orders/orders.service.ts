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
                        orders = ordersJson.data;
                        orders.forEach((order) => {
                            let totalPrice = 0;
                            order.orderDetails.forEach((element) => {
                                totalPrice += element.price;
                            });
                            order.totalPrice = totalPrice;
                            const newDetails: Array<{ amount: number, description: string, price: number}> = [];
                            while (order.orderDetails.length > 0) {
                                const detail = order.orderDetails.shift();
                                let counter = 1;
                                const elementsToRemove = [];
                                for (let i = 0; i < order.orderDetails.length; i++) {
                                    if (order.orderDetails[i].description === detail.description) {
                                        counter++;
                                        elementsToRemove.push(i);
                                    }
                                }
                                detail.amount = counter;
                                elementsToRemove.forEach((position) => {
                                   order.orderDetails.splice(position, 1);
                                });
                                newDetails.push(detail);
                            }
                            order.orderDetails = newDetails;
                        });
                        res(orders);
                    })
                    .catch((err) => {
                        rej(err);
                    });
            });
    });
  }

  getOrdersWithFilters(filtes: Array<any>): Promise<any> {
      return new Promise((res, rej) => {
          this.http.get('', {}, {})
              .then((data) => {
                res(data);
              })
              .catch((error) => {
                console.log(error);
                rej(error);
              });
      });
  }

  parseOrderDetails(orderDetailsString: string): Array<{description: string, price: number}> {
      const orderDetails = [];
      const details: Array<string> = orderDetailsString.split('|&&|');
      details.forEach((detail) => {
          const detailElements = detail.split('|,,|');
         // Actually there is only 2 fields in the detail
          const detailJson = {
              description: detailElements[0],
              price: detailElements[1],
              amount: detailElements[2],
              itemNumber: detailElements[3]
          };
          orderDetails.push(detailJson);
      });
      return orderDetails;
  }


  stringifyOrderDetails(orderDetails: Array<{description: string, price: number}>): string {
      let orderDetailString = '';
      orderDetails.forEach((detail: any) => {
          orderDetailString = orderDetailString + detail.description + '|,,|' + detail.price + '|,,|' + detail.amount + '|,,|' + detail.itemNumber + '|&&|';
      });
      orderDetailString = orderDetailString.substr(0, orderDetailString.length - 4);
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
