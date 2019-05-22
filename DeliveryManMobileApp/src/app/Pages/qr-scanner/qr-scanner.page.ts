import { Component, OnInit, NgZone } from '@angular/core';
import { AlertController, NavController} from '@ionic/angular';
import { NavigationExtras } from '@angular/router';

// Providers
import {QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
})
export class QrScannerPage implements OnInit {
  private scanSubscription: any = null;

  constructor(
      private navCtrl: NavController,
      private qrScanner: QRScanner,
      private zone: NgZone,
      private alertCtrl: AlertController) { }

  ngOnInit() {
      this.qrScanner.prepare()
          .then((status: QRScannerStatus) => {
              if (status.authorized) {
                  // camera permission was granted

                  // start scanning
                  this.scanSubscription = this.qrScanner.scan().subscribe(async (text: string) => {
                      console.log('Scanned something', text);
                      this.qrScanner.hide(); // hide camera preview
                      this.scanSubscription.unsubscribe(); // stop scanning
                      // Any by now...
                      let QRJson: any = null;
                      try {
                          QRJson = JSON.parse(text);
                      } catch (error) {
                          console.log('error', error);
                      }
                      if (QRJson) {
                          // Gotta check it's a json with the structure I want
                          const navigationExtras: NavigationExtras = {
                              queryParams: {
                                  deliveryId: QRJson.deliverId,
                                  name: QRJson.name,
                                  phone: QRJson.phone,
                                  direction: QRJson.direction
                              }
                          };
                          console.log('json', navigationExtras);
                          this.zone.run(() => {
                              this.navCtrl.navigateForward(['/map'], navigationExtras); // Redirect to map
                          });
                      } else {
                          const alert: any = await this.alertCtrl.create({
                              header: 'El código escaneado no es un pedido',
                              buttons: [
                                  {
                                      text: 'Aceptar',
                                      handler: () => {
                                          this.zone.run(() => {
                                              this.navCtrl.navigateRoot('/home');
                                          });
                                      }
                                  }
                              ]
                          });
                          await alert.present();
                      }
                  });
                  this.qrScanner.show();
              } else if (status.denied) {
                  console.log('denied');
                  this.qrScanner.openSettings();
                  // camera permission was permanently denied
                  // you must use QRScanner.openSettings() method to guide the user to the settings page
                  // then they can grant the permission from there
              } else {
                  console.log('denied not permanently');
                  // permission was denied, but not permanently. You can ask for permission again at a later time.
              }
          })
          .catch((e: any) => {
              console.log('Error is', e);
              this.navCtrl.navigateBack('/home');
          });
  }

  // Gotta see if there is anothe life cycle method now
  ionViewWillLeave() {
    this.qrScanner.destroy();
    if (this.scanSubscription) {
        this.scanSubscription.unsubscribe(); // stop scanning
    }
  }

  close() {
    this.navCtrl.navigateBack('/home');
  }

}
