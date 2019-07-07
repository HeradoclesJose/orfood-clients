import { Component, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, IonInfiniteScroll, NavController } from '@ionic/angular';

// Services
import { OrdersService } from '../../Services/orders/orders.service';
import { AuthService } from '../../Services/auth/auth.service';
import { QrService } from '../../Services/qr/qr.service';

// Models
import { Order } from '../../Interfaces/order';



@Component({
  selector: 'app-tab-orders',
  templateUrl: './tab-orders.page.html',
  styleUrls: ['./tab-orders.page.scss'],
})
export class TabOrdersPage {
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    private dataList: Array<any> = [];
    private loading: boolean = true;
    private thereIsOrders: boolean = false; // Kinda unnecessary but makes me feel the code is cleaner
    private ordersInterval: any = null;
    private qrLoading: boolean = false;


  constructor(
      private orderService: OrdersService,
      private qr: QrService,
      private alertCtrl: AlertController,
      private auth: AuthService,
      private navCtrl: NavController,
      ) {}


  ionViewWillEnter() {
      this.orderService.getOrdersInDelivery()
          .then((data: Array<Order>) => {
            this.dataList = data;
            if (this.dataList.length > 0) {
                this.thereIsOrders = true;
            }
            this.loading = false;
          })
          .catch((err) => {
            console.log(err);
          });
      this.ordersInterval = setInterval(() => {
          console.log('Se ejecuta');
          this.orderService.getOrdersInDelivery()
              .then((data: Array<Order>) => {
                  data.forEach((order: Order, index: number) => {
                      const isAlreadyInList: boolean = this.dataList.some((orderInList: Order) => {
                          return orderInList.orderId === order.orderId;
                      });
                      if (!isAlreadyInList) {
                          console.log('one new', order);
                          this.dataList.push(order);
                      }
                  });
                  if(this.dataList.length > 0) {
                      this.thereIsOrders = true;
                  } else {
                      this.thereIsOrders = false;
                  }
                  this.loading = false;
              });
      }, 30000);
  }

    ionViewDidLeave() {
      clearInterval(this.ordersInterval);
    }

  goToOrderDetails(order: Order) {
      this.qrLoading = true;
      this.qr.generateQr({
          deliveryId: order.orderId.toString(),
          name: order.clientName,
          phone: order.cellphone,
          direction: order.direction
      })
          .then((data) => {
          console.log(data);
          this.qrLoading = false;
          const detailsString = this.orderService.stringifyOrderDetails(order.orderDetails);
          console.log(detailsString);
          const navigationExtras: NavigationExtras = {
              queryParams: {
                  orderId: order.orderId,
                  clientName: order.clientName,
                  orderDate: order.orderDate,
                  direction: order.direction,
                  orderDetails: detailsString,
                  totalPrice: order.totalPrice
              }
          };
          this.navCtrl.navigateForward(['/order-details'], navigationExtras); // Redirect to map
          })
          .catch((err) => {
            console.log(err);
            this.qrLoading = false;
          });
  }

 /*   loadData(event) {

        setTimeout(() => {
            for (let i = 0; i < 25; i++) {
                const orderData = {
                    id: i + this.dataList.length,
                    direction: 'Valle del cauca, Cali, Cra 98 #53-181 Senderos de la pradera',
                    price: '10€'
                };
                this.dataList.push(orderData);
            }
            event.target.complete();
            // App logic to determine if all data is loaded
            // and disable the infinite scroll
            if (this.dataList.length == 1000) {
                event.target.disabled = true;
            }
        }, 500);
    }*/

    async logout() {
        const logoutAlert: any = await this.alertCtrl.create({
            header: '¿Desea cerrar sesión?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary'
                },
                {
                    text: 'Confirmar',
                    handler: () => {
                        this.auth.logout()
                            .then(() => {
                                this.navCtrl.navigateBack('');
                            });
                    }
                }
            ]
        });
        await logoutAlert.present();
    }

}
