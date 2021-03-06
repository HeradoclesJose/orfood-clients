import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';

// Models
import { QrData } from '../../Interfaces/qr-data';
import { BASE_URL, MAIN_PORT } from '../../API/BaseUrl';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private qrUrl: string = BASE_URL + MAIN_PORT + '/qrcreate';

  constructor(
      private http: HTTP,
      private storage: Storage
  ) { }

  generateQr(qrData: QrData) {
    return new Promise((res, rej) => {
        this.storage.get('token')
            .then((token) => {
                const headers: any = {
                    Authorization: 'Bearer ' + token
                };
                this.http.post(this.qrUrl, qrData, headers)
                    .then((data) => {
                      res(data);
                    })
                    .catch((error) => {
                      rej(error);
                    });
            });
    });
  }
}
