import { Component } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';

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
    private dataList: Array<Order> = [];
    private loading: boolean = true;
    private thereIsOrders: boolean = false; // Kinda unnecessary but makes me feel the code is cleaner
    private ordersInterval: any = null;
    private intervalFrequenzy: number = 90000; // A minute and a half, could be increased
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
          .catch((error) => {
            console.log('getOrdersError', error);
          });
      this.ordersInterval = setInterval(() => {
          this.orderService.getOrdersInDelivery()
              .then((data: Array<Order>) => {
                  if (data.length > 0) {
                      this.thereIsOrders = true;
                      data.forEach((order: Order) => {
                          const isAlreadyInList: boolean = this.dataList.some((orderInList: Order) => {
                              return orderInList.orderId === order.orderId;
                          });
                          if (!isAlreadyInList) {
                              this.dataList.push(order);
                          }
                      });
                  } else {
                      this.thereIsOrders = false;
                  }
                  this.loading = false;
              });
      }, this.intervalFrequenzy);
  }

   ionViewWillLeave() {
      clearInterval(this.ordersInterval);
   }

  goToOrderDetails(order: Order) {
      this.qrLoading = true;
      this.qr.generateQr({
          deliveryId: order.orderId.toString(),
          name: order.clientName,
          phone: order.phone,
          direction: order.address
      })
          .then(() => {
          this.qrLoading = false;
          const detailsString = this.orderService.stringifyOrderDetails(order.orderDetails);
          const navigationExtras: NavigationExtras = {
              queryParams: {
                  orderId: order.orderId,
                  clientName: order.clientName,
                  orderDate: order.orderDate,
                  address: order.address,
                  orderDetails: detailsString,
                  totalPrice: order.totalPrice,
                  phone: order.phone
              }
          };
          this.navCtrl.navigateForward(['/order-details'], navigationExtras);
          })
          .catch(async (error) => {
            console.log('QRGeneratingError', error);
            this.qrLoading = false;
            const qrError: any = await this.alertCtrl.create({
                header: 'Error',
                message: 'Ocurrió un error al intentar generar el codigo QR del pedido',
                buttons: [
                    {
                        text: 'Aceptar',
                        role: 'cancel',
                        cssClass: 'secondary'
                    }
                ]
            });
            await qrError.present();
          });
  }


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
