import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonSelect,
  IonSelectOption
} from '@ionic/angular';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  createOutline,
  calendarOutline,
  timeOutline,
  gridOutline,
  checkmarkOutline
} from 'ionicons/icons';

interface TaskForm {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.page.html',
  styleUrls: ['./edit-task.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,

    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonSelect,
    IonSelectOption
  ]
})
export class EditTaskPage {

  task: TaskForm = {
    title: 'Complete Project',
    description: 'Finish the remaining parts of the project.',
    date: new Date().toISOString(),
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    priority: 'High',
    category: 'School'
  };

  constructor(
    private router: Router
  ) {

    addIcons({
      arrowBackOutline,
      createOutline,
      calendarOutline,
      timeOutline,
      gridOutline,
      checkmarkOutline
    });

  }


  // ==============================
  // PRIORITY
  // ==============================

  selectPriority(
    priority: 'High' | 'Medium' | 'Low'
  ) {

    this.task.priority = priority;

  }


  // ==============================
  // SAVE CHANGES
  // ==============================

  saveChanges() {

    if (!this.task.title.trim()) {

      console.log('Task title is required');

      return;

    }

    console.log('Updated Task:', this.task);

    // Firebase update will be connected here later.

    this.router.navigate(['/task-details']);

  }


  // ==============================
  // BACK
  // ==============================

  goBack() {

    this.router.navigate(['/home']);

  }

}