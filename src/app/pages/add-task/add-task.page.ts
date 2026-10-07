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
  IonSelectOption,
  ToastController
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

import { TaskService } from '../../services/task.service';

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
    date: this.nowLocalIso(),
    startTime: this.nowLocalIso(),
    endTime: this.nowLocalIso(),
    priority: 'Medium',
    category: ''
  };

  constructor(
    private router: Router,
    private taskService: TaskService,
    private toastController: ToastController
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

  async saveTask() {

    if (!this.task.title.trim()) {

      const toast = await this.toastController.create({
        message: 'Please enter a task title',
        duration: 1800,
        position: 'top'
      });

      await toast.present();

      return;
    }

    // Turn the date picker text (e.g. "2026-10-05...") into a real Date
    // for that day, which Home and Activity need.
    const [year, month, day] = this.task.date
      .substring(0, 10)
      .split('-')
      .map(Number);

    try {
      await this.taskService.add({
        id: Date.now(),
        title: this.task.title.trim(),
        description: this.task.description,
        date: new Date(year, month - 1, day),
        time: `${this.formatTime(this.task.startTime)} - ${this.formatTime(this.task.endTime)}`,
        priority: this.task.priority,
        category: this.task.category || 'Others',
        completed: false
      });
      await this.router.navigate(['/home']);
    } catch (error) {
      const toast = await this.toastController.create({
        message: error instanceof Error ? error.message : String(error),
        duration: 2600,
        position: 'top'
      });
      await toast.present();
    }
  }


  // ==============================
  // HELPERS
  // ==============================

  // Current local time as an ISO string without "Z", so the date and time
  // pickers show your real local time (Philippines), not UTC.
  private nowLocalIso(): string {

    const d = new Date();

    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 19);
  }

  // "2026-10-05T14:30:00" -> "2:30 PM"
  private formatTime(iso: string): string {

    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }


  // ==============================
  // BACK
  // ==============================

  goBack() {

    this.router.navigate(['/home']);
  }

}