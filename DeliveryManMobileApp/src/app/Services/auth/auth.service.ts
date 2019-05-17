import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl: string = 'https://ptsv2.com'; // replace with login url

  constructor(private http: HTTP, private storage: Storage) { }

  login(loginData: any) {
      return new Promise((resolve) => {
          this.http.post(this.loginUrl, loginData, {})
              .then((data: any) => {
                  this.storage.set('sesion', 'active'); // Just to know the user is logged later
                  resolve(data);
              });
      });
  }

  logout() {
      return new Promise((resolve) => {
          this.storage.remove('sesion')
              .then(() => {
                  resolve();
              });
        });
  }
}
