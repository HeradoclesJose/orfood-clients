import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';

// Models
import {BASE_URL, MAIN_PORT } from '../../API/BaseUrl';

@Injectable({
  providedIn: 'root'
})
export class DeliveryStatusService {
  private url: string = BASE_URL + MAIN_PORT + '/update-wc-status';

  constructor(private http: HTTP, private storage: Storage) { }

  updateStatus(updateData: any) {
    return new Promise((res, rej) => {
        this.storage.get('token')
            .then((token) => {
                const headers: any = {
                    Authorization: 'Bearer ' + token
                };
                this.http.post(this.url, updateData, headers)
                    .then((data) => {
                        res(data);
                    })
                    .catch((err) => {
                        rej(err);
                    });
            });
    });
  }
}
