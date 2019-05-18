import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

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
  constructor(private auth: AuthService, private navCtrl: NavController) { }

  ngOnInit() {
  }

  login() {
      this.loading = true;
      this.auth.login(this.loginData)
          .then((data: any) => {
            console.log('login data', data); // Check server response to allow login
            this.loading = false;
            this.navCtrl.navigateForward('/home');
          })
          .catch((error) => {
            // Show error message for user
            this.loading = false;
            console.log(error);
          });
  }

}
