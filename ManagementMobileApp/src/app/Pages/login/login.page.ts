import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';

// Services
import { AuthService } from '../../Services/auth/auth.service';

// Models
import { ServerResponse } from '../../Interfaces/server-response';

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
                console.log('login data', data); // Check server response to allow login
                this.loading = false;
                if (data.status === '200' && data.message === 'Inicio exitoso') {
                    this.loginData.user = '';
                    this.loginData.password = '';
                    this.navCtrl.navigateForward('/tabs');
                } else {
                    const alert: any = await this.alertCtrl.create({
                        header: 'Error',
                        message: data.message,
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
