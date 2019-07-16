export interface Order {
    orderId: number;
    clientName: string;
    orderDate: string;
    address: string;
    orderDetails: any; // Array<{description:string, price: number, amount: number, itenNumber: string}> | string
    totalPrice: number;
    phone: string;
}
