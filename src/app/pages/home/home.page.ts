import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription } from 'rxjs';

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
  AlertController,
  ToastController
} from '@ionic/angular';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import {
  funnelOutline,
  add,
  ellipsisVertical,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { TaskService, Task } from '../../services/task.service';

register();

type PriorityFilter = 'All' | 'High' | 'Medium' | 'Low';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
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
export class HomePage implements OnInit, OnDestroy {

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  }

  selectedDate: Date = new Date();
  days: Date[] = [];
  tasks: Task[] = [];

  // Current priority filter (changed from the funnel button)
  selectedPriority: PriorityFilter = 'All';

  private sub!: Subscription;

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      funnelOutline,
      add,
      ellipsisVertical,
      checkmarkCircleOutline
    });

    this.generateDays();
  }

  ngOnInit() {
    this.sub = this.taskService.tasks.subscribe(tasks => {
      this.tasks = tasks;
      this.cdr.detectChanges(); // refresh the screen right away
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
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
      this.isSameDate(task.date, this.selectedDate) &&
      this.matchesPriority(task)
    );
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(task =>
      task.completed &&
      this.isSameDate(task.date, this.selectedDate) &&
      this.matchesPriority(task)
    );
  }

  get totalTasks(): number {
    return this.tasks.filter(task =>
      this.isSameDate(task.date, this.selectedDate) &&
      this.matchesPriority(task)
    ).length;
  }

  get progress(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round(
      (this.completedTasks.length / this.totalTasks) * 100
    );
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // True when the task matches the selected priority filter
  private matchesPriority(task: Task): boolean {
    return (
      this.selectedPriority === 'All' ||
      task.priority === this.selectedPriority
    );
  }

  // ==============================
  // COMPLETE TASK
  // ==============================
  async setTaskCompleted(task: Task, completed: boolean) {
    try {
      await this.taskService.setCompleted(task, completed);
    } catch (error) {
      await this.showTaskError(error);
    }
  }

  // ==============================
  // TASK MENU
  // ==============================
  async openTaskMenu(task: Task) {
    const actionSheet = await this.actionSheetController.create({
      header: task.title,
      buttons: [
        {
          text: 'Edit',
          handler: () => { this.editTask(task); }
        },
        {
          text: task.completed
            ? 'Mark as Incomplete'
            : 'Mark as Complete',
          handler: () => { this.setTaskCompleted(task, !task.completed); }
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => { this.deleteTask(task); }
        },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  // ==============================
  // EDIT TASK
  // ==============================
  editTask(task: Task) {
    this.router.navigate(['/edit-task'], {
      queryParams: { id: task.id }
    });
  }

  // ==============================
  // DELETE TASK
  // ==============================
  async deleteTask(task: Task) {
    const alert = await this.alertController.create({
      header: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.taskService.remove(task.id).catch(error => this.showTaskError(error));
          }
        }
      ]
    });
    await alert.present();
  }

  private async showTaskError(error: unknown) {
    const toast = await this.toastController.create({
      message: error instanceof Error ? error.message : String(error),
      duration: 2600,
      position: 'top'
    });
    await toast.present();
  }

  // ==============================
  // FILTER
  // ==============================
  setFilter(priority: PriorityFilter) {
    this.selectedPriority = priority;
    this.cdr.detectChanges(); // refresh the list right away
  }

  async openFilterOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filter Tasks',
      buttons: [
        { text: 'All Tasks', handler: () => { this.setFilter('All'); } },
        { text: 'High Priority', handler: () => { this.setFilter('High'); } },
        { text: 'Medium Priority', handler: () => { this.setFilter('Medium'); } },
        { text: 'Low Priority', handler: () => { this.setFilter('Low'); } },
        { text: 'Cancel', role: 'cancel' }
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