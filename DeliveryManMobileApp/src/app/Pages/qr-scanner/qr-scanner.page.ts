import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
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

  constructor(private navCtrl: NavController, private qrScanner: QRScanner) { }

  ngOnInit() {
      this.qrScanner.prepare()
          .then((status: QRScannerStatus) => {
              if (status.authorized) {
                  // camera permission was granted

                  // start scanning
                  this.scanSubscription = this.qrScanner.scan().subscribe((text: string) => {
                      console.log('Scanned something', text);
                      this.qrScanner.hide(); // hide camera preview
                      this.scanSubscription.unsubscribe(); // stop scanning
                      const navigationExtras: NavigationExtras = {
                          queryParams: {
                              userData: text.substr(7, text.length)
                          }
                      };
                      console.log('json', navigationExtras);
                      this.navCtrl.navigateForward(['/map'],  navigationExtras); // Redirect to map
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
