import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

// Services
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { HtmlGeneratorService } from '../../Services/html-generator/html-generator.service';
import { OrdersService } from '../../Services/orders/orders.service';
import { Storage } from '@ionic/storage';

// Models
import { Order } from '../../Interfaces/order';
import { BASE_URL, MAIN_PORT } from '../../API/BaseUrl';
import {DeliveryStatusService} from '../../Services/delivery-status/delivery-status.service';


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  private html: string = '';
  private invoiceWasPrinted: boolean = false; // Not a reliable check but... is something
  private order: Order = null;
  private restaurantName: string = 'Arepas Santa rita';
  private qrImageUrl: string = '';

  constructor(
      private route: ActivatedRoute,
      private printer: Printer,
      private htmlGenerator: HtmlGeneratorService,
      private orderService: OrdersService,
      private storage: Storage,
      private deliveryStatus: DeliveryStatusService,
      private navCtrl: NavController
  ) { }

  ngOnInit() {
      this.route.queryParams.subscribe((params: any) => {
          const {
              orderId,
              clientName,
              orderDate,
              address,
              orderDetails,
              totalPrice,
              phone
          } = params;
          this.order = {
              orderId,
              clientName,
              orderDate,
              address,
              orderDetails,
              totalPrice,
              phone
          };
          this.qrImageUrl = BASE_URL + MAIN_PORT + '/qrcodes/' + this.order.orderId + '.png';
      });
      this.order.orderDetails = this.orderService.parseOrderDetails(this.order.orderDetails);
    /*  this.orderService.parseOrderDetails(this.order.orderDetails).forEach((detail) => {
         this.auxArrayForDetails.push(detail);
      });*/
      this.storage.get('permissions')
          .then((data) => {
            console.log(data);
            this.restaurantName = data.restaurant;
          });
  }

  printOrder() {
      const options: PrintOptions = {
          name: 'Order-' + this.order.orderId,
          duplex: true,
          landscape: true,
          grayscale: true
      };
      this.html = this.htmlGenerator.getHTML(this.order, this.restaurantName, this.qrImageUrl);
      this.printer.print(this.html, options)
          .then((data: any) => {
          console.log('success', data);
          this.invoiceWasPrinted = true;
          })
          .catch((error) => {
              console.log('error', error);
          });
  }

  finishInvoice() {
      const updateData = {
          orderId: this.order.orderId,
          wcStatus: 'cook'
      };
      this.deliveryStatus.updateStatus(updateData)
          .then((data) => {
            console.log(data);
              this.navCtrl.navigateForward('/tabs'); // Redirect to map

          })
          .catch((err) => {
            console.log(err);
          });
  }

}
