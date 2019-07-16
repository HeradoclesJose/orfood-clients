import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController} from '@ionic/angular';

// Services
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { HtmlGeneratorService } from '../../Services/html-generator/html-generator.service';
import { OrdersService } from '../../Services/orders/orders.service';
import { DeliveryStatusService } from '../../Services/delivery-status/delivery-status.service';
import { Storage } from '@ionic/storage';

// Models
import { Order } from '../../Interfaces/order';
import { BASE_URL, MAIN_PORT } from '../../API/BaseUrl';
import {OrderStatusData} from "../../Interfaces/order-status-data";

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  private html: string = '';
  private invoiceWasPrinted: boolean = false; // Not a reliable check but... is something
  private order: Order = null;
  private restaurantName: string = '';
  private qrImageUrl: string = '';

  constructor(
      private route: ActivatedRoute,
      private printer: Printer,
      private htmlGenerator: HtmlGeneratorService,
      private orderService: OrdersService,
      private storage: Storage,
      private deliveryStatus: DeliveryStatusService,
      private navCtrl: NavController,
      private alertCtrl: AlertController
  ) { }

  ngOnInit() {
      this.route.queryParams.subscribe((params: Order) => {
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
      this.storage.get('permissions')
          .then((data: {restaurant: string, level: string }) => {
            this.restaurantName = data.restaurant;
          })
          .catch(async (error) => {
              console.log('PermissionsError', error);
              const alert: any = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'Ha ocurrido un error al revisar tus permisos de seguridad',
                  buttons: [
                      {
                          text: 'Aceptar',
                          handler: () => {
                              this.navCtrl.navigateBack('');
                          },
                          cssClass: 'secondary'
                      }
                  ]
              });
              await alert.present();
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
          .then(() => {
          // Sometimes when you press the hardware backbutton this will be executed
          // even if the document was not printed
          this.invoiceWasPrinted = true;
          })
          .catch((error) => {
              console.log('PrinterError', error);
          });
  }

  finishInvoice() {
      const updateData: OrderStatusData = {
          orderId: this.order.orderId.toString(),
          wcStatus: 'cook'
      };
      this.deliveryStatus.updateStatus(updateData)
          .then(() => {
            this.navCtrl.navigateForward('/tabs');
          })
          .catch(async (error) => {
            console.log('UpdateError', error);
            const alert: any = await this.alertCtrl.create({
                header: 'Error',
                message: 'Ha ocurrido un error al intentar actualizar el estado del pedido',
                buttons: [
                    {
                        text: 'Aceptar',
                        handler: () => {
                            this.navCtrl.navigateForward('/tabs');
                        },
                        cssClass: 'secondary'
                    }
                ]
              });
            await alert.present();
          });
  }

}
