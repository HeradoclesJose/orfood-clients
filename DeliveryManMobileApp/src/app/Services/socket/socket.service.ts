import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

// Models
import {SocketData} from '../../Interfaces/socket-data';
import {BASE_URL, SOCKET_PORT} from '../../API/BaseUrl';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private roomCreated: boolean = false;
  private socket: any = null;
  private url: string =  BASE_URL + SOCKET_PORT;

  constructor() { }

  connect(initData: SocketData) { // Gotta use this id to make the room
      this.socket = io(this.url);
      this.socket.emit('create', JSON.stringify(initData));
      this.roomCreated = true;
  }

  send(event: string, message: SocketData) {
      if (this.socket && this.roomCreated) {
          this.socket.emit(event, JSON.stringify(message));
      }
  }

  disconnect() {
      this.socket.disconnect();
  }
}
