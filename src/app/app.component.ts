import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular';

import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';

import {
  homeOutline,
  home,
  pulseOutline,
  pulse,
  settingsOutline,
  settings,
} from 'ionicons/icons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],

  imports: [
    IonApp,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    CommonModule
  ],
})
export class AppComponent {

  showNavbar = false;

  currentRoute = '';

  constructor(public router: Router) {

    addIcons({
      homeOutline,
      home,
      pulseOutline,
      pulse,
      settingsOutline,
      settings
    });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {

        this.currentRoute = event.urlAfterRedirects;

        this.updateNavbarVisibility();

      });

    this.currentRoute = this.router.url;

    this.updateNavbarVisibility();
  }


  // ==============================
  // NAVBAR VISIBILITY
  // ==============================

  private updateNavbarVisibility() {

    const hiddenRoutes = [
      '/login',
      '/signup',
      '/splash',
      '/add-task',
      '/edit-task',
      '/task-details'
    ];

    this.showNavbar =
      !hiddenRoutes.some(route =>
        this.currentRoute.startsWith(route)
      );

  }


  // ==============================
  // ACTIVE TAB
  // ==============================

  isActive(route: string): boolean {

    return this.currentRoute === route ||
      this.currentRoute.startsWith(route + '/');

  }

}