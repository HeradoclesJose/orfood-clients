export interface Order {
    orderId: number,
    clientName: string,
    orderDate: string
    direction: string,
    orderDetails: any //Array<{description:string, price: number}> | string
    totalPrice: number
}
