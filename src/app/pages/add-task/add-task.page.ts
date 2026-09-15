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
  selector: 'app-add-task',
  templateUrl: './add-task.page.html',
  styleUrls: ['./add-task.page.scss'],
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
export class AddTaskPage {

  task: TaskForm = {
    title: '',
    description: '',
    date: new Date().toISOString(),
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    priority: 'Medium',
    category: ''
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
  // SAVE TASK
  // ==============================

  saveTask() {

    if (!this.task.title.trim()) {

      console.log('Task title is required');

      return;
    }

    console.log('New Task:', this.task);

    // Firebase will be connected here later.

    this.router.navigate(['/home']);
  }


  // ==============================
  // BACK
  // ==============================

  goBack() {

    this.router.navigate(['/home']);
  }

}