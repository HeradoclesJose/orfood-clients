import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

// Models
import {SocketData} from '../../Interfaces/socket-data';
import { BASE_URL } from '../../API/BaseUrl';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private testing: boolean = true;
  private roomCreated: boolean = false;
  private socket: any = null;
  private url: string = this.testing ? 'http://192.168.1.23:9391/geolocationOrfood' : BASE_URL + '/geolocationOrfood';

  constructor() { }

  connect(initData: SocketData) { // Gotta use this id to make the room
      this.socket = io(this.url);
      this.socket.emit('create', JSON.stringify(initData));
      this.roomCreated = true; // Hoping is sycronous
  }

  // events
  // create => json{id,idman, lat, long} ya estare en el room
  // join => client the wordpress idOrden me da la posicion me mete en el room, da la posicion inicial
  // position => json{idpedido, idman, lat, lng} Actualizar y emitir a la gente en el room
  // getPosition => wordpress
  // idOrder: data.order, idDeliveryMan: data.delivery, lat: data.latitude, long: data.longitude

  send(event: string, message: SocketData) {
      if (this.socket && this.roomCreated) {
          this.socket.emit(event, JSON.stringify(message));
      }
  }

  disconnect() {
      this.socket.disconnect();
  }
}
