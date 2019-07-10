import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Providers
import { Storage } from '@ionic/storage';
import { JwtDecoderService } from './Services/jwt-decoder/jwt-decoder.service';

// Model
import { TokenBody } from './Interfaces/token-body';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private navCtrl: NavController,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
        this.storage.get('token')
            .then((data) => {
                if (data) { // If there is a sesion
                    this.navCtrl.navigateForward('/home')
                        .then(() => {
                            setTimeout(() => {
                                this.hideSplashAndStatusBar();
                            }, 1000);
                        })
                        .catch((error) => {
                            console.log(error);
                            this.hideSplashAndStatusBar();
                        });
                } else {
                    this.hideSplashAndStatusBar();
                }
            })
            .catch((error) => {
                console.log(error);
                this.hideSplashAndStatusBar();
            });
    });
  }

  hideSplashAndStatusBar() {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
  }
}
