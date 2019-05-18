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
      const permissionToAskFor: Array<string> = [];
      return new Promise((resolve) => {
          this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA)
              .then((data: any) => {
                if (!data.hasPermission) {
                    permissionToAskFor.push(this.androidPermissions.PERMISSION.CAMERA);
                }
                console.log('here', this.androidPermissions.PERMISSION);
                this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
                    .then((data2: any) => {
                        console.log(data2);
                        if (!data2.hasPermission) {
                           permissionToAskFor.push(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
                        }
                        if (permissionToAskFor.length > 0) {
                            this.androidPermissions.requestPermissions(permissionToAskFor)
                                .then((permissionsData: any) => {
                                    console.log(permissionsData);
                                    resolve(permissionsData.hasPermission);
                                })
                                .catch(() => resolve(false)); // Gotta add an alert
                        } else {
                            resolve(true);
                        }
                    });
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
