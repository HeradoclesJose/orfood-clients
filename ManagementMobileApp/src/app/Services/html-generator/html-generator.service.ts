import { Injectable } from '@angular/core';

// Models
import { Order } from '../../Interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class HtmlGeneratorService {
    private htmlStart: string = '<div style="width:240px; margin: 0 auto; background:white; padding: 20px;">';
    private htmlEnd: string = '</div>';

    constructor() { }

  getHTML(order: Order, restaurant: string, image: string): string {
      // Invoice Header
        const invoiceHeader = '<div style="text-align: center; border-bottom:1px dashed black;"> <img style="width: 120px;" src="' + image + '">';
        const invoiceHeader2 = '<div><p style="font-size: 18px">' + restaurant + '</p></div></div>';

      // First Invoice body
        const invoiceBodyStart1 = '<div style="text-align: center;">';
        const invoideBodyStart2 = '<p style="margin-bottom: 0;  margin-top: 13px;" >' + order.orderDate + '</p>';
        const invoiceBodyStart3 = '<p style="margin-bottom: 13px;  margin-top: 13px;" >No. de pedido: ' + order.orderId + '</p></div>';
        const invoiceWholeBodyStart = invoiceBodyStart1 + invoideBodyStart2 + invoiceBodyStart3;

        // Invoice details
        const invoiceDetails1 = '<div style="border-top: 1px dashed black;  border-bottom: 1px dashed black;  margin-top: 13px;">';
        // This line was not being displayed when printed
        // const invoiceDetails2 = '<div style="display:flex; justify-content:flex-end;"><p style="margin-top:10px; margin-bottom:0px;" >EUR</p></div>';
        let invoiceDetails3 = '';
        // generate html for every detail in the invoice
        order.orderDetails.forEach((detail) => {
            const detailHtml = '<div style="padding: 5px; margin-bottom: 13px; margin-top: 13px; display: flex;  justify-content: space-between; font-size: 12px;"><span>' + detail.amount + 'x  #' + detail.itemNumber + ' ' + detail.description + '</span><span>' + detail.price * detail.amount + ' EUR</span></div><br>';
            invoiceDetails3 = invoiceDetails3 + detailHtml;
        });
        invoiceDetails3 = invoiceDetails3 + '</div>';
        const invoiceWholeDetails = invoiceDetails1 + invoiceDetails3;

        // Invoice Total
        const invoiceTotal1 = '<div style="display: flex;  justify-content: space-between;  border-bottom: 1px dashed black; margin-top: 10px; margin-bottom: 10px; margin-right: 5px">';
        const invoiceTotal2 = ' <p style="font-size: 12px;">Total</p> <p style="font-size: 12px; ">' + order.totalPrice + ' EUR</p></div>';
        const invoiceWholeTotal = invoiceTotal1 + invoiceTotal2;

        // Invoice Client Details
        const invoiceClientDetails1 = '<div><p style="margin-bottom: 1px;">Detalles del cliente</p>';
        const invoiceClientDetails2 = '<p style="margin-top: 10px;  margin-bottom: 0;  font-size: 16px;">Nombre: ' + order.clientName + '</p>';
        const invoiceClientDetails3 = '<p style="margin-top: 10px;  margin-bottom: 0;  font-size: 16px;">Direccion: ' + order.address + '</p>';
        const invoiceClientDetails4 = '<p style=" margin-bottom: 1px;">Para contactar con el cliente,\n llama al: ' + order.phone + '</p></div>';
        const invoiceWholeClientDetails = invoiceClientDetails1 + invoiceClientDetails2 + invoiceClientDetails3 + invoiceClientDetails4;

        const html = this.htmlStart + invoiceHeader + invoiceHeader2 + invoiceWholeBodyStart;
        const html2 = invoiceWholeDetails + invoiceWholeTotal + invoiceWholeClientDetails + this.htmlEnd;
        return html + html2;
  }
}
