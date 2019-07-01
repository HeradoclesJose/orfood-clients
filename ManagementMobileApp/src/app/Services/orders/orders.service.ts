import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';

// Models
import { BASE_URL } from '../../API/BaseUrl';
import { Order } from "../../Interfaces/order";

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  // private loginUrl: string = BASE_URL
  private ordersInDeliveryUrl: string = BASE_URL + '/delivery/actual';
  private ordersDoneUrl: string = BASE_URL + '/delivery/done';

  constructor(private http: HTTP) { }

  getOrdersInDelivery(): Promise<any> {
    return new Promise((res, rej) => {
        this.http.get('https://httpbin.org/get', {}, {})
            .then((data: any) => {
                const orders: Array<Order> = [];
                const rn = new Date();
                const day = rn.getDate();
                const month = rn.getUTCMonth() + 1;
                const year = rn.getFullYear();
                // By now
                for (let i = 0; i < 15; i++) {
                    const orderData: Order = {
                        orderId: i + 1,
                        clientName: 'Pedro Gonzalez',
                        orderDate: day + '/' + month + '/' + year,
                        direction: 'Valle del cauca, Cali, Cra 98 #53-181 Senderos de la pradera',
                        orderDetails: [
                            {
                                description: 'Tiger Tempura Roll',
                                price: 50
                            },
                            {
                                description: 'California Tempura Roll',
                                price: 50
                            }
                        ],
                        totalPrice: 100,
                    };
                    orders.push(orderData);
                }
                res(orders);
            })
            .catch((err) => {
                rej(err);
            })
    })
  }

  parseOrderDetails(orderDetailsString:string): Array<{description: string, price:number}> {
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
