import { Component } from '@angular/core';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonCheckbox
} from '@ionic/angular';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  mailOutline,
  callOutline,
  lockClosedOutline,
  eyeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonCheckbox
  ]
})
export class SignupPage {

  constructor(private router: Router) {

    addIcons({
      arrowBackOutline,
      personOutline,
      mailOutline,
      callOutline,
      lockClosedOutline,
      eyeOutline
    });

  }

  goBack() {
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}