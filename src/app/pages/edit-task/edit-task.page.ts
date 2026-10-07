import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  createOutline,
  calendarOutline,
  timeOutline,
  gridOutline,
  checkmarkOutline
} from 'ionicons/icons';

import { TaskService, Task } from '../../services/task.service';

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
export class EditTaskPage implements OnInit {

  // The task from the service that is being edited
  private original?: Task;

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
    private router: Router,
    private route: ActivatedRoute,
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
  // LOAD TASK
  // ==============================

  ngOnInit() {

    // Home sends the task id: /edit-task?id=1
    this.route.queryParamMap.subscribe(params => {

      const id = Number(params.get('id'));

      const found = this.taskService
        .getAll()
        .find(t => t.id === id);

      if (!found) {

        // No task to edit, so go back to Home
        this.router.navigate(['/home']);

        return;
      }

      this.original = found;

      // Fill the form with the task's current values
      this.task = {
        title: found.title,
        description: found.description,
        date: this.toLocalIso(found.date),
        startTime: this.parseTime(found.time.split('-')[0], found.date),
        endTime: this.parseTime(found.time.split('-')[1] || found.time.split('-')[0], found.date),
        priority: found.priority,
        category: found.category
      };

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

  async saveChanges() {

    if (!this.task.title.trim()) {

      const toast = await this.toastController.create({
        message: 'Please enter a task title',
        duration: 1800,
        position: 'top'
      });

      await toast.present();

      return;

    }

    if (!this.original) {

      return;

    }

    // Turn the date picker text into a real Date for that day
    const [year, month, day] = this.task.date
      .substring(0, 10)
      .split('-')
      .map(Number);

    // Keep id, completed and completedAt from the original task
    try {
      await this.taskService.update({
        ...this.original,
        title: this.task.title.trim(),
        description: this.task.description,
        date: new Date(year, month - 1, day),
        time: `${this.formatTime(this.task.startTime)} - ${this.formatTime(this.task.endTime)}`,
        priority: this.task.priority,
        category: this.task.category || 'Others'
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

  // Date -> local ISO text without "Z" (what the pickers expect)
  private toLocalIso(date: Date): string {

    const d = new Date(date);

    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 19);

  }

  // "9:00 AM" + a day -> local ISO text for that time
  private parseTime(text: string, base: Date): string {

    const d = new Date(base);

    const match = text.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    if (match) {

      let hours = Number(match[1]) % 12;

      if (match[3].toUpperCase() === 'PM') {
        hours += 12;
      }

      d.setHours(hours, Number(match[2]), 0, 0);

    }

    return this.toLocalIso(d);

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