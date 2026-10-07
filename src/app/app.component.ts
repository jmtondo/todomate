import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonApp,
  IonRouterOutlet,
  IonIcon
} from '@ionic/angular';

import {
  Router,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';

import {
  homeOutline,
  home,
  pulseOutline,
  pulse,
  settingsOutline,
  settings
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],

  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
    IonIcon
  ],
})
export class AppComponent {

  showNavbar = false;
  currentRoute = '';

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {

    addIcons({
      homeOutline,
      home,
      pulseOutline,
      pulse,
      settingsOutline,
      settings
    });

    /*
     * Detect every route change.
     */
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => {

        this.currentRoute = event.urlAfterRedirects;

        this.updateNavbarVisibility();

        // Make sure the navbar updates immediately
        this.cdr.detectChanges();
      });

    /*
     * Handle direct URL navigation such as:
     * localhost:8100/home
     */
    setTimeout(() => {
      this.currentRoute = this.router.url;
      this.updateNavbarVisibility();
      this.cdr.detectChanges();
    });
  }


  private updateNavbarVisibility() {

    const hiddenRoutes = [
      '/splash',
      '/login',
      '/signup',
      '/new-task',
      '/add-task',
      '/edit-task',
      '/task-details'
    ];

    this.showNavbar = !hiddenRoutes.some(route =>
      this.currentRoute.startsWith(route)
    );
  }


  isActive(route: string): boolean {

    return (
      this.currentRoute === route ||
      this.currentRoute.startsWith(route + '/')
    );
  }


  goTo(route: string) {
    this.router.navigate([route]);
  }

}