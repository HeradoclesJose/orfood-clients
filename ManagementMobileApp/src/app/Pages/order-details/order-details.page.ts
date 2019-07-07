import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { HtmlGeneratorService } from '../../Services/html-generator/html-generator.service';
import { OrdersService } from '../../Services/orders/orders.service';
import { Storage } from '@ionic/storage';

// Models
import { Order } from '../../Interfaces/order';


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

  constructor(
      private route: ActivatedRoute,
      private printer: Printer,
      private htmlGenerator: HtmlGeneratorService,
      private orderService: OrdersService,
      private storage: Storage
  ) { }

  ngOnInit() {
      this.route.queryParams.subscribe((params: any) => {
          const {
              orderId,
              clientName,
              orderDate,
              direction,
              orderDetails,
              totalPrice,
              cellphone
          } = params;
          this.order = {
              orderId,
              clientName,
              orderDate,
              direction,
              orderDetails,
              totalPrice,
              cellphone};
      });
      this.order.orderDetails = this.orderService.parseOrderDetails(this.order.orderDetails);
    /*  this.orderService.parseOrderDetails(this.order.orderDetails).forEach((detail) => {
         this.auxArrayForDetails.push(detail);
      });*/
      console.log(this.order);
      this.storage.get('permissions')
          .then((data) => {
            console.log(data);
          });
  }



  printOrder() {
      const options: PrintOptions = {
          name: 'Order-' + this.order.orderId,
          duplex: true,
          landscape: true,
          grayscale: true
      };
      this.html = this.htmlGenerator.getHTML(this.order);
      this.printer.print(this.html, options)
          .then((data:any) => {
          console.log('success', data);
          this.invoiceWasPrinted = true;
          })
          .catch((error) => {
              console.log('error', error);
          })
  }

}
