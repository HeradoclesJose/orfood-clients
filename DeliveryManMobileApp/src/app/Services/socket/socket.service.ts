import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

// Models
import {SocketData} from '../../Interfaces/socket-data';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any = null;
  private url: string = 'http://192.168.1.23:3001';

  constructor() { }

  connect(id: string) { // Gotta use this id to make the room
      this.socket = io(this.url);
  }

  send(message: SocketData) {
      if (this.socket) {
          this.socket.emit('message', message);
      }
  }
}
