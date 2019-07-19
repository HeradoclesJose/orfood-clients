import { Component, OnInit } from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import { OrdersService } from '../../Services/orders/orders.service';
import { NavigationExtras } from '@angular/router';

// Models
import { Order } from '../../Interfaces/order';
import { QrService } from '../../Services/qr/qr.service';

@Component({
  selector: 'app-tab-orders-completed',
  templateUrl: './tab-orders-completed.page.html',
  styleUrls: ['./tab-orders-completed.page.scss'],
})
export class TabOrdersCompletedPage implements OnInit {

    private ordersInDisplay: Array<Order> = [];
    private ordersInStorage: Array<Order> = [];
    private loading: boolean = true;
    private qrLoading: boolean = false;
    private amountOfOrdersPerLoading: number = 5;
    private filtersOpen: boolean = false;

    constructor(
        private orderService: OrdersService,
        private qr: QrService,
        private navCtrl: NavController,
        private alertCtrl: AlertController
    ) {}

    ngOnInit() {
        this.orderService.getOrdersInDelivery()
            .then((data: Array<Order>) => {
                this.ordersInStorage = data;
                if (this.ordersInStorage.length > this.amountOfOrdersPerLoading) {
                    this.ordersInDisplay = this.ordersInStorage.splice(0, this.amountOfOrdersPerLoading);
                } else {
                    this.ordersInDisplay = this.ordersInStorage;
                }
                this.loading = false;
            })
            .catch((error) => {
                console.log('getOrdersError', error);
            });
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

    loadData(event) {
        setTimeout(() => {
            event.target.complete();
            this.ordersInDisplay = this.ordersInDisplay.concat(this.ordersInStorage.splice(0, this.amountOfOrdersPerLoading));
            if (this.ordersInStorage.length <= 0) {
                event.target.disabled = true;
            }
        }, 500);
    }

    toggleFilter() {
        this.filtersOpen = !this.filtersOpen;
    }

}
