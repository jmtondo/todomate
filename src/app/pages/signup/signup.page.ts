import { Component } from '@angular/core';
import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonCheckbox,
  ToastController
} from '@ionic/angular';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  mailOutline,
  callOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

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
    IonCheckbox,
    FormsModule
  ]
})
export class SignupPage {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptedTerms = false;
  busy = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toastController: ToastController
  ) {

    addIcons({
      arrowBackOutline,
      personOutline,
      mailOutline,
      callOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline
    });

  }

  togglePasswordVisibility(value: string | number | null | undefined) {
    this.password = String(value ?? '');
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(value: string | number | null | undefined) {
    this.confirmPassword = String(value ?? '');
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async register() {
    if (!this.firstName.trim() || !this.email.trim() || !this.password) {
      await this.showMessage('Complete the required fields.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      await this.showMessage('Passwords do not match.');
      return;
    }
    if (!this.acceptedTerms) {
      await this.showMessage('Please accept the terms to continue.');
      return;
    }

    this.busy = true;
    try {
      const displayName = `${this.firstName.trim()} ${this.lastName.trim()}`.trim();
      await this.auth.register(this.email.trim(), this.password, displayName, this.phone.trim());
      await this.router.navigate(['/home']);
    } catch (error) {
      await this.showMessage(error instanceof Error ? error.message : String(error));
    } finally {
      this.busy = false;
    }
  }

  private async showMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2600,
      position: 'top'
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}