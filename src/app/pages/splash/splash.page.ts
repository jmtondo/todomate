import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline,
  arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    RouterLink
  ]
})
export class SplashPage {

  constructor() {
    addIcons({
      checkmarkOutline,
      arrowForwardOutline
    });
  }

}