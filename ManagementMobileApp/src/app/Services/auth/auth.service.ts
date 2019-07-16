import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';

// Models
import { BASE_URL, MAIN_PORT } from '../../API/BaseUrl';
import { ServerResponse } from '../../Interfaces/server-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl: string = BASE_URL + MAIN_PORT + '/login';

  constructor(private http: HTTP, private storage: Storage) { }

  login(loginData: any) {
      return new Promise((resolve) => {
          this.http.post(this.loginUrl, loginData, {})
              .then((response: any) => {
                  console.log(response.data);
                  const data: ServerResponse = JSON.parse(response.data);
                  if (data.status === '200' && data.response === 'You are now logged in.') {
                      console.log('Aqui toke', data);
                      this.storage.set('token', data.token);
                      this.storage.set('permissions', data.permissions);
                      resolve({ message: 'Inicio exitoso', status: data.status});
                  } else {
                      // Switch to handle all the codes and give a proper response
                      // By now:
                      resolve({ message: 'Usuario y contraseña incorrectos', status: data.status});
                  }
              });
      });
  }

  logout() {
      return new Promise((resolve) => {
          this.storage.remove('token')
              .then(() => {
                this.storage.remove('permissions')
                    .then(() => {
                        resolve();
                    });
              });
        });
  }

}
