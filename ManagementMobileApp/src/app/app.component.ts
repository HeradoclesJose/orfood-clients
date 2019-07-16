import { Component } from '@angular/core';

import { NavController, Platform} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Services
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private storage: Storage,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
        this.storage.get('token')
            .then((data) => {
                if (data) { // If there is a sesion
                    this.navCtrl.navigateForward('/tabs')
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
            .catch(() => {
                // No Token found
                this.hideSplashAndStatusBar();
            });
    });
  }

  hideSplashAndStatusBar() {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
  }
}
