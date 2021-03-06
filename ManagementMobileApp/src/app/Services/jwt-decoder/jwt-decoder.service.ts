import { Injectable } from '@angular/core';

// Provider
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {

  constructor(private storage: Storage) {}

  getBody(): Promise<any> {
    return new Promise((resolve) => {
        this.storage.get('token')
            .then((token: string) => {
              const splitToken: Array<string> = token.split('.');
              const body = atob(splitToken[1]);
              resolve(JSON.parse(body));
            });
    });
  }
}
