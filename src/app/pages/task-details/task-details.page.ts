import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton
} from '@ionic/angular';

import { Router } from '@angular/router';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.page.html',
  styleUrls: ['./task-details.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class TaskDetailsPage {

  constructor(
    private router: Router
  ) {}

  editTask() {

    this.router.navigate(['/edit-task']);

  }

}