import { Component } from '@angular/core';
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
    backButtonSubscription: any = null;

    constructor(
        private auth: AuthService,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private platform: Platform
    ) { }

    ionViewDidEnter() {
        this.backButtonSubscription = this.platform.backButton.subscribe(() => {
            navigator['app'].exitApp();
        });
    }

    ionViewWillLeave() {
        this.backButtonSubscription.unsubscribe();
    }

    login() {
        this.loading = true;
        this.auth.login(this.loginData)
            .then(async (data: any) => {
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
            .catch(async (error) => {
                // Should be improved
                console.log('LoginError', error);
                this.loading = false;
                const alert: any = await this.alertCtrl.create({
                    header: 'Error',
                    message: 'Ha ocurrido un error inesperado',
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
