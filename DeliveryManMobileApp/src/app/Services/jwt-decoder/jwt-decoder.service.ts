import { Injectable } from '@angular/core';

// Provider
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {

  // Could get the token here, but if a method is executed and token isn't retrieved from ls...
  constructor(private storage: Storage) {}

  getBody(): Promise<any> {
    return new Promise((res, rej) => {
        this.storage.get('token')
            .then((token: string) => {
              const splitToken: Array<string> = token.split('.');
              const body = atob(splitToken[1]);
              res(JSON.parse(body));
            })
            .catch((error) => {
                rej(error);
            });
    });
  }
}
