import { Component, OnInit, ViewChild } from '@angular/core';
import {AlertController, NavController, IonInfiniteScroll } from '@ionic/angular';
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
    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

    private ordersInDisplay: Array<Order> = [];
    private ordersInStorage: Array<Order> = [];
    private loading: boolean = true;
    private qrLoading: boolean = false;
    private amountOfOrdersPerLoading: number = 5;
    private filtersOpen: boolean = false;
    private timeFilter: string = '';
    private priceFilter: string = '';

    constructor(
        private orderService: OrdersService,
        private qr: QrService,
        private navCtrl: NavController,
        private alertCtrl: AlertController
    ) {}

    ngOnInit() {
        this.orderService.getOrdersWithFilters({ filterType: 'no-filter', filterValue: null})
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

    search() {
        this.infiniteScroll.disabled = false;
        this.ordersInStorage.length = 0;
        this.ordersInDisplay.length = 0;
        let filterParams: { filterType: string, filterValue: any };
        this.loading = true;
        if (this.timeFilter !== '' && this.priceFilter !== '') {
            filterParams = { filterType: 'price-time', filterValue: JSON.stringify({ price: this.priceFilter, time: this.timeFilter }) };
        } else if (this.timeFilter !== '') {
            filterParams = { filterType: 'time', filterValue: this.timeFilter };
        } else if (this.priceFilter !== '') {
            filterParams = { filterType: 'price', filterValue: this.priceFilter};
        } else {
            filterParams = { filterType: 'no-filter', filterValue: null};
        }
        this.orderService.getOrdersWithFilters(filterParams)
            .then((data) => {
                console.log('data', data);
                this.ordersInStorage = data;
                if (this.ordersInStorage.length > this.amountOfOrdersPerLoading) {
                    this.ordersInDisplay = data.splice(0, this.amountOfOrdersPerLoading); // Doing it like before gave me problems
                    console.log(this.ordersInDisplay);
                } else {
                    this.ordersInDisplay = data;
                }
                this.loading = false;
            })
            .catch((error) => {
                console.log('OrdersWithFiltersError', error);
                // Should show an error on screen
                this.loading = false;
            });
    }

    toggleFilter() {
        this.filtersOpen = !this.filtersOpen;
    }

}
