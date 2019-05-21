import { Injectable } from '@angular/core';

// Providers
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';

// Models
import { BASE_URL } from '../../API/BaseUrl';
import { ServerResponse } from '../../Interfaces/server-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl: string = BASE_URL + '/login'; // replace with login url
  private signUpUrl: string = BASE_URL + '/signup';

  constructor(private http: HTTP, private storage: Storage) { }

  login(loginData: any) {
      return new Promise((resolve) => {
          this.http.post(this.loginUrl, loginData, {})
              .then((response: any) => {
                  const data: ServerResponse = JSON.parse(response.data);
                  if (data.status === '200' && data.response === 'You are now logged in.') {
                      this.storage.set('token', data.token); // Just to know the user is logged later
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
                  resolve();
              });
        });
  }

 /* tokenTest() {
      return new Promise((resolve) => {
          this.storage.get('token')
              .then((token) => {
                  const headers: any = {
                       Authorization: 'Bearer ' + token
                  };
                  console.log(headers);
                  this.http.post(this.signUpUrl, {name: 'Pedro', user: '1', password: '1'}, headers)
                      .then((data: any) => {
                          console.log('respuesta heroku:', data);
                      })
                      .catch((error) => {
                          console.log(error);
                      });
              });
      });
  }*/
}
