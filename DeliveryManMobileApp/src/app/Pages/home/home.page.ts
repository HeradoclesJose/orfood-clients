import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';


// Providers
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';


// Services
import { AuthService } from '../../Services/auth/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(
      private auth: AuthService,
      private navCtrl: NavController,
      private alertCtrl: AlertController,
      private androidPermissions: AndroidPermissions,
      private platform: Platform
  ) {}

  scanCode() {
      if (this.platform.is('android')) {
          this.checkPermissions()
              .then((hasPermissions: boolean) => {
                if (hasPermissions) {
                    this.navCtrl.navigateForward('/qr-scanner');
                }
              });
      } else {
          this.navCtrl.navigateForward('/qr-scanner');
      }
  }

  checkPermissions() {
      // Still gotta find a way to ask for permissions if user denies them forever
      return new Promise((resolve) => {
          this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA)
              .then((data: any) => {
                if (data.hasPermission) {
                    resolve(true);
                } else {
                    console.log('here');
                    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
                        .then((data2: any) => {
                            resolve(data2.hasPermission);
                        })
                        .catch((err: any) => {
                            console.log(err);
                            resolve(false);
                        });
                }
              });
      });
  }

  async logout() {
    const logoutAlert: any = await this.alertCtrl.create({
        header: '¿Desea cerrar sesión?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary'
            },
            {
                text: 'Confirmar',
                handler: () => {
                    this.auth.logout()
                        .then(() => {
                            this.navCtrl.navigateBack('');
                        });
                }
            }
        ]
    });
    await logoutAlert.present();
  }
}
