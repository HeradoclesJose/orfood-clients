import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';

// Models
import { BASE_URL } from '../../API/BaseUrl';

@Injectable({
  providedIn: 'root'
})
export class DeliveryStatusService {
  private url: string = BASE_URL + '/update-wc-status';

  constructor(private http: HTTP) { }

  updateStatus(updateData: any) {
    return new Promise((resolve) => {
        resolve();
        /*this.http.post(this.url, updateData, {})
            .then((data) => {
                resolve(data);
            });*/
    });
  }
}
