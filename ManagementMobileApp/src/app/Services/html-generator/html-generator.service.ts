import { Injectable } from '@angular/core';

// Models
import { Order } from '../../Interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class HtmlGeneratorService {
    private htmlStart: string = '<div style="width: 250px; margin:0 auto; background:white; border: solid 1px black; padding: 20px;">';
    private invoiceHeader: string = '<div style="text-align: center"> <img style="width: 15vw;" src="https://dby250rdnxby3.cloudfront.net/wp-content/uploads/2012/10/Generate-and-Read-QR-Codes-Online.png"></div>';
    private htmlEnd: string = '</div>';

    constructor() { }

  getHTML(order: Order): string {
        // Invoice body
        const invoiceBody1 = '<div><div style="display: flex; justify-content:space-between;"><p style="margin-bottom:0;">No. de órden: ' + order.orderId + '</p>';
        const invoideBody2 = '<p style="margin-bottom:0;" >Fecha: ' + order.orderDate + '</p></div>';
        const invoiceBody3 = '<p style="margin-top: 8px;  margin-bottom: 0;" >Cliente: ' + order.clientName + '</p>';
        const invoiceBody4 = '<p style="margin-top: 8px;  margin-bottom: 0;" >Direccion: ' + order.direction + '</p></div>';
        const invoiceWholeBody = invoiceBody1 + invoideBody2 + invoiceBody3 + invoiceBody4;

        //Invoice details
        const invoiceDetails1 = '<div style="border-top: 1px solid black;  border-bottom: 1px solid black;  margin-top: 6px;">';
        const invoiceDetails2 = '<div><p style="margin-top: 10px; margin-bottom: 0px;" >Pedido: </p></div>';
        let invoiceDetails3 = '';
        // generate html for every detail in the invoice
        order.orderDetails.forEach((detail) => {
            const detailHtml = '<div><div style="padding: 5px;  display: flex;  justify-content: space-between;"><span>' + detail.description + '</span><span>' + detail.price + '€</span></div></div>';
            invoiceDetails3 = invoiceDetails3 + detailHtml;
        });
        invoiceDetails3 = invoiceDetails3 + '</div>';
        const invoiceWholeDetails = invoiceDetails1 + invoiceDetails2 +invoiceDetails3;

        //Invoice Total
        const invoiceTotal = '<div style="display: flex;  justify-content: flex-end;"><p>Total ' + order.totalPrice + '€</p></div>';

        const html: string = this.htmlStart + this.invoiceHeader + invoiceWholeBody + invoiceWholeDetails + invoiceTotal + this.htmlEnd;
        return html;
  }
}
