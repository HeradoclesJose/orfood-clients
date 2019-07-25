import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';

// Services
import { AuthService } from '../../Services/auth/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginData: {user: string, password: string} = {user: '', password: ''};
  loading: boolean = false;
  subscription: any = null

  constructor(
      private auth: AuthService,
      private navCtrl: NavController,
      private alertCtrl: AlertController,
      private platform: Platform
  ) { }

  ionViewDidEnter() {
      this.subscription = this.platform.backButton.subscribe(() => {
          navigator['app'].exitApp();
      });
  }

  ionViewWillLeave(){
      this.subscription.unsubscribe();
  }

    login() {
        this.loading = true;
        this.auth.login(this.loginData)
            .then(async (data: any) => {
                this.loading = false;
                if (data.status === '200' && data.message === 'Inicio exitoso') {
                    this.loginData.user = '';
                    this.loginData.password = '';
                    this.navCtrl.navigateForward('/home');
                }
                // Maybe an unnecessary if, but... extra security
            })
            .catch(async (error) => {
                console.log('LoginError', error);
                this.loading = false;
                const alert: any = await this.alertCtrl.create({
                    header: 'Error',
                    message: error.message,
                    buttons: [
                        {
                            text: 'Aceptar',
                            role: 'cancel',
                            cssClass: 'secondary'
                        }
                    ]
                });
                await alert.present();
            });
    }

}
