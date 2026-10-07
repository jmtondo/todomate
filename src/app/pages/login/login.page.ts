import { Component } from '@angular/core';

import {
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  ToastController
} from '@ionic/angular';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';

import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    FormsModule
  ]
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  busy = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toastController: ToastController
  ) {

    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline
    });

  }

  togglePasswordVisibility(value: string | number | null | undefined) {
    this.password = String(value ?? '');
    this.showPassword = !this.showPassword;
  }

  async login() {
    this.busy = true;
    try {
      await this.auth.login(this.email.trim(), this.password);
      await this.router.navigate(['/home']);
    } catch (error) {
      await this.showError(error);
    } finally {
      this.busy = false;
    }
  }

  async forgotPassword() {
    if (!this.email.trim()) {
      await this.showError('Enter your email address first.');
      return;
    }
    try {
      await this.auth.resetPassword(this.email.trim());
      await this.showError('Password reset email sent.');
    } catch (error) {
      await this.showError(error);
    }
  }

  private async showError(error: unknown) {
    const toast = await this.toastController.create({
      message: error instanceof Error ? error.message : String(error),
      duration: 2600,
      position: 'top'
    });
    await toast.present();
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

}
