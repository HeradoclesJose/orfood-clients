import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

// Services
import { AuthService } from '../../Services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private loginData: {user: string, password: string} = {user: '', password: ''};
  private loading: boolean = false;

  constructor(
      private auth: AuthService,
      private navCtrl: NavController,
      private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  login() {
      this.loading = true;
      this.auth.login(this.loginData)
          .then(async (data: any) => {
            console.log('login data', data); // Check server response to allow login
            this.loading = false;
            if (true) {
                this.navCtrl.navigateForward('/home');
            } else {
                const alert: any = await this.alertCtrl.create({
                    header: 'Error',
                    message: 'Respuesta del servidor',
                    buttons: [
                        {
                            text: 'Aceptar',
                            role: 'cancel',
                            cssClass: 'secondary'
                        }
                    ]
                });
                await alert.present();
            }
          })
          .catch((error) => {
            // Show error message for user
            this.loading = false;
            console.log(error);
          });
  }

}
