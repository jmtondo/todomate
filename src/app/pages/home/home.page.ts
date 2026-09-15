import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { register } from 'swiper/element/bundle';

import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCheckbox,
  IonFab,
  IonFabButton,
  ActionSheetController,
  AlertController
} from '@ionic/angular';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  funnelOutline,
  add,
  ellipsisVertical,
  checkmarkCircleOutline
} from 'ionicons/icons';

// Register Swiper Web Components
register();

interface Task {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,

  // Allow Swiper Web Components
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCheckbox,
    IonFab,
    IonFabButton
  ]
})
export class HomePage {

  selectedDate: Date = new Date();

  days: Date[] = [];

  tasks: Task[] = [
    {
      id: 1,
      title: 'Study Quantitative Methods',
      description: 'Review the simplex method',
      date: new Date(),
      time: '9:00 AM - 10:30 AM',
      priority: 'High',
      completed: false
    },

    {
      id: 2,
      title: 'Work on TodoMate',
      description: 'Continue designing the home page',
      date: new Date(),
      time: '1:00 PM - 2:30 PM',
      priority: 'Medium',
      completed: false
    },

    {
      id: 3,
      title: 'Submit Assignment',
      description: 'Upload the completed activity',
      date: new Date(),
      time: '4:00 PM - 5:00 PM',
      priority: 'Low',
      completed: true
    }
  ];

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) {

    addIcons({
      funnelOutline,
      add,
      ellipsisVertical,
      checkmarkCircleOutline
    });

    this.generateDays();
  }

  // ==============================
  // DATE PICKER
  // ==============================

  generateDays() {

    const today = new Date();

    this.days = [];

    for (let i = -2; i <= 7; i++) {

      const date = new Date(today);

      date.setDate(today.getDate() + i);

      this.days.push(date);
    }
  }

  selectDate(date: Date) {

    this.selectedDate = date;
  }

  isSelectedDate(date: Date): boolean {

    return (
      date.getFullYear() === this.selectedDate.getFullYear() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getDate() === this.selectedDate.getDate()
    );
  }

  // ==============================
  // TASK FILTERING
  // ==============================

  get filteredTasks(): Task[] {

    return this.tasks.filter(task =>
      !task.completed &&
      this.isSameDate(task.date, this.selectedDate)
    );
  }

  get completedTasks(): Task[] {

    return this.tasks.filter(task =>
      task.completed &&
      this.isSameDate(task.date, this.selectedDate)
    );
  }

  get totalTasks(): number {

    return this.tasks.filter(task =>
      this.isSameDate(task.date, this.selectedDate)
    ).length;
  }

  get progress(): number {

    if (this.totalTasks === 0) {
      return 0;
    }

    return Math.round(
      (this.completedTasks.length / this.totalTasks) * 100
    );
  }

  private isSameDate(
    date1: Date,
    date2: Date
  ): boolean {

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // ==============================
  // COMPLETE TASK
  // ==============================

  toggleComplete(task: Task) {

    task.completed = !task.completed;
  }

  // ==============================
  // TASK MENU
  // ==============================

  async openTaskMenu(task: Task) {

    const actionSheet =
      await this.actionSheetController.create({

        header: task.title,

        buttons: [

          {
            text: 'Edit',

            handler: () => {
              this.editTask(task);
            }
          },

          {
            text: task.completed
              ? 'Mark as Incomplete'
              : 'Mark as Complete',

            handler: () => {
              this.toggleComplete(task);
            }
          },

          {
            text: 'Delete',
            role: 'destructive',

            handler: () => {
              this.deleteTask(task);
            }
          },

          {
            text: 'Cancel',
            role: 'cancel'
          }

        ]
      });

    await actionSheet.present();
  }

  // ==============================
  // EDIT TASK
  // ==============================

  editTask(task: Task) {

    this.router.navigate(['/edit-task'], {
      queryParams: {
        id: task.id
      }
    });
  }

  // ==============================
  // DELETE TASK
  // ==============================

  async deleteTask(task: Task) {

    const alert =
      await this.alertController.create({

        header: 'Delete Task',

        message:
          `Are you sure you want to delete "${task.title}"?`,

        buttons: [

          {
            text: 'Cancel',
            role: 'cancel'
          },

          {
            text: 'Delete',
            role: 'destructive',

            handler: () => {

              this.tasks = this.tasks.filter(
                item => item.id !== task.id
              );

            }
          }

        ]
      });

    await alert.present();
  }

  // ==============================
  // FILTER
  // ==============================

  async openFilterOptions() {

    const actionSheet =
      await this.actionSheetController.create({

        header: 'Filter Tasks',

        buttons: [

          {
            text: 'All Tasks',

            handler: () => {
              console.log('All tasks');
            }
          },

          {
            text: 'High Priority',

            handler: () => {
              console.log('High priority');
            }
          },

          {
            text: 'Medium Priority',

            handler: () => {
              console.log('Medium priority');
            }
          },

          {
            text: 'Low Priority',

            handler: () => {
              console.log('Low priority');
            }
          },

          {
            text: 'Cancel',
            role: 'cancel'
          }

        ]
      });

    await actionSheet.present();
  }

  // ==============================
  // NEW TASK
  // ==============================

  goToNewTask() {

    this.router.navigate(['/new-task']);
  }

}