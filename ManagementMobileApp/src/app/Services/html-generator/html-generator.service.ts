import { Injectable } from '@angular/core';

// Models
import { Order } from '../../Interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class HtmlGeneratorService {
    private htmlStart: string = '<div style="width: 255px; margin:0 auto; background:white; padding: 20px;">';
    private htmlEnd: string = '</div>';

    constructor() { }

  getHTML(order: Order, restaurant: string, image: string): string {
        // Invoice Header
        const invoiceHeader = '<div style="text-align: center; border-bottom:1px solid black;"> <img style="width: 15vw;" src="' + image + '">';
        const invoiceHeader2 = '<div><p class="restaurant-text">' + restaurant + '</p></div></div>';

    /*  <div class="first-invoice-section">
      <p class="text-first-invoice-margin">{{this.order.orderDate}}</p>
      <p class="text-first-invoice-margin">Número de pedido: {{this.order.orderId}}</p>
      </div>*/

      // First Invoice body
        const invoiceBodyStart1 = '<div style="text-align: center;  font-size: 110%;">';
        const invoideBodyStart2 = '<p style="margin-bottom: 0;  margin-top: 1.5vw;" >' + order.orderDate + '</p>';
        const invoiceBodyStart3 = '<p style="margin-bottom: 0;  margin-top: 1.5vw;" >Número de pedido: ' + order.orderId + '</p></div>';
        const invoiceWholeBodyStart = invoiceBodyStart1 + invoideBodyStart2 + invoiceBodyStart3;

        // Invoice details
        const invoiceDetails1 = '<div style="border-top: 1px solid black;  border-bottom: 1px solid black;  margin-top: 1.5vh;">';
        const invoiceDetails2 = '<div style="display:flex; justify-content:flex-end;"><p style="margin-top:10px; margin-bottom:0px;" >EUR</p></div>';
        let invoiceDetails3 = '';
        // generate html for every detail in the invoice
        order.orderDetails.forEach((detail) => {
            const detailHtml = '<div><div style="padding: 5px;  display: flex;  justify-content: space-between;"><span style="font-size: 80%;">' + detail.amount + 'x  #' + detail.itemNumber + '</span><span>' + detail.description + '</span><span>' + detail.price + '€</span></div></div>';
            invoiceDetails3 = invoiceDetails3 + detailHtml;
        });
        invoiceDetails3 = invoiceDetails3 + '</div>';
        const invoiceWholeDetails = invoiceDetails1 + invoiceDetails2 + invoiceDetails3;

        // Invoice Total
        const invoiceTotal1 = '<div style="display: flex;  justify-content: space-between;  border-bottom: 1px solid black;">';
        const invoiceTotal2 = ' <p class="total-text">Total</p> <p class="total-text">' + order.totalPrice + '€</p></div>';
        const invoiceWholeTotal = invoiceTotal1 + invoiceTotal2;

        // Invoice Client Details
        const invoiceClientDetails1 = '<div><p style="margin-bottom: 0;">Detalles del cliente</p>';
        const invoiceClientDetails2 = '<p style="margin-top: 1vh;  margin-bottom: 0;  font-size: 120%;">Nombre: ' + order.clientName + '</p>';
        const invoiceClientDetails3 = '<p style="margin-top: 1vh;  margin-bottom: 0;  font-size: 120%;">Direccion: ' + order.address + '</p>';
        const invoiceClientDetails4 = '<p style=" margin-bottom: 0;">Para contactar con el cliente, llama al:</p>';
        const invoiceClientDetails5 = '<p style="margin-top: 1vh;  margin-bottom: 0;  font-size: 120%;">' + order.phone + '</p></div>';
        const invoiceWholeClientDetails = invoiceClientDetails1 + invoiceClientDetails2 + invoiceClientDetails3 + invoiceClientDetails4 + invoiceClientDetails5;

        const html = this.htmlStart + invoiceHeader + invoiceHeader2 + invoiceWholeBodyStart;
        const html2 = invoiceWholeDetails + invoiceWholeTotal + invoiceWholeClientDetails + this.htmlEnd;
        return html + html2;
  }
}
