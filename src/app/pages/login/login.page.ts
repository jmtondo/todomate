import { Component } from '@angular/core';

import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  mailOutline,
  lockClosedOutline,
  eyeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class LoginPage {

  constructor(private router: Router) {

    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline
    });

  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

}

