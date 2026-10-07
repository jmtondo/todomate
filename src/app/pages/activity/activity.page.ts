import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  timerOutline,
  barChartOutline,
  statsChartOutline,
  refreshOutline,
  play,
  pause,
  playSkipForwardOutline,
  checkmarkDoneOutline,
  timeOutline,
  flameOutline,
  trophyOutline
} from 'ionicons/icons';

import { TaskService, Task } from '../../services/task.service';

type Mode = 'focus' | 'short' | 'long';
type Period = 'weekly' | 'monthly';

interface ChartItem {
  label: string;
  value: number;
  height: number;
}

interface CategoryStat {
  name: string;
  count: number;
  percent: number;
}

interface PriorityStat {
  label: 'High' | 'Medium' | 'Low';
  count: number;
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon
  ]
})
export class ActivityPage implements OnInit, OnDestroy {

  showStats = false;

  // Pomodoro
  mode: Mode = 'focus';
  isRunning = false;
  displayTime = '25:00';
  completedSessions = 0;
  circumference = 2 * Math.PI * 90;
  dashOffset = this.circumference + 1; // ring starts empty

  // Full length of each mode in seconds
  // (to test quickly, temporarily change focus to 10)
  private durations: Record<Mode, number> = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  // Time left in the current mode, in milliseconds
  private remainingMs = this.durations.focus * 1000;

  // Time left for each mode, so Focus stays where you paused it
  private savedMs: Record<Mode, number> = {
    focus: this.durations.focus * 1000,
    short: this.durations.short * 1000,
    long: this.durations.long * 1000
  };

  // The exact clock time (ms) when the running timer will reach 0
  private endTime = 0;
  private timerId: any = null;

  // Statistics
  period: Period = 'weekly';
  tasks: Task[] = [];

  totalCompleted = 0;
  totalPending = 0;
  completionRate = 0;
  bestDay: { label: string; count: number } | null = null;
  chartData: ChartItem[] = [];
  chartMax = 1;
  categoryStats: CategoryStat[] = [];
  priorityStats: PriorityStat[] = [];

  private sub!: Subscription;

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    addIcons({
      timerOutline,
      barChartOutline,
      statsChartOutline,
      refreshOutline,
      play,
      pause,
      playSkipForwardOutline,
      checkmarkDoneOutline,
      timeOutline,
      flameOutline,
      trophyOutline
    });
  }

  ngOnInit() {
    this.sub = this.taskService.tasks.subscribe(tasks => {
      this.tasks = tasks;
      this.computeStats();
    });
    this.updateDisplay();
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.sub) this.sub.unsubscribe();
  }

  // ==============================
  // VIEW
  // ==============================
  setView(view: 'pomodoro' | 'stats') {
    this.showStats = view === 'stats';
  }

  switchView() {
    this.showStats = !this.showStats;
  }

  // ==============================
  // POMODORO
  // ==============================
  get modeLabel(): string {
    return this.mode === 'focus'
      ? 'Focus Time'
      : this.mode === 'short'
        ? 'Short Break'
        : 'Long Break';
  }

  get ringColor(): string {
    return this.mode === 'focus'
      ? '#3760f9'
      : this.mode === 'short'
        ? '#d2fc59'
        : '#17161b';
  }

  // Start, Pause, or Resume depending on the timer state
  get buttonLabel(): string {
    if (this.isRunning) return 'Pause';

    const started = this.remainingMs < this.durations[this.mode] * 1000;
    return started ? 'Resume' : 'Start';
  }

  setMode(mode: Mode) {
    if (mode === this.mode) return;

    // Pause and remember where this mode stopped
    this.stopTimer();
    this.savedMs[this.mode] = this.remainingMs;

    // Load the time that the new mode had left
    this.mode = mode;
    this.remainingMs = this.savedMs[mode];
    this.updateDisplay();
  }

  toggleTimer() {
    this.isRunning ? this.stopTimer() : this.startTimer();
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;

    // The timer finishes at a fixed clock time, so it stays accurate
    // even if the browser slows down the interval in the background.
    this.endTime = Date.now() + this.remainingMs;

    // Run outside Angular so it doesn't re-check the whole app every tick.
    // We refresh this page manually with detectChanges() instead.
    this.ngZone.runOutsideAngular(() => {
      this.timerId = setInterval(() => this.tick(), 250);
    });
  }

  private tick() {
    this.remainingMs = Math.max(0, this.endTime - Date.now());

    if (this.remainingMs <= 0) {
      this.completeSession(true);
      return;
    }

    this.updateDisplay();
    this.cdr.detectChanges(); // makes the time and ring update on screen
  }

  stopTimer() {
    // Save the exact time left when pausing
    if (this.isRunning) {
      this.remainingMs = Math.max(0, this.endTime - Date.now());
    }

    this.isRunning = false;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // Resets only the mode you are on
  resetTimer() {
    this.stopTimer();
    this.remainingMs = this.durations[this.mode] * 1000;
    this.savedMs[this.mode] = this.remainingMs;
    this.updateDisplay();
  }

  skipTimer() {
    // Skipping moves to the next mode but does not count as a finished session
    this.completeSession(false);
  }

  completeSession(counted: boolean = true) {
    this.stopTimer();

    // A finished (or skipped) mode starts fresh the next time you open it
    this.savedMs[this.mode] = this.durations[this.mode] * 1000;

    // Fills one dot only when a full focus session reaches 00:00
    if (this.mode === 'focus' && counted) {
      this.completedSessions++;
    }

    this.mode = this.mode === 'focus'
      ? (this.completedSessions > 0 && this.completedSessions % 4 === 0 ? 'long' : 'short')
      : 'focus';

    // Continue from whatever the next mode had left (a paused Focus resumes)
    this.remainingMs = this.savedMs[this.mode];
    this.updateDisplay();
    this.cdr.detectChanges();
  }

  private updateDisplay() {
    const totalSeconds = Math.ceil(this.remainingMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    this.displayTime =
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    this.updateRing();
  }

  private updateRing() {
    const totalMs = this.durations[this.mode] * 1000;

    // 0 = just started, 1 = finished. The ring fills with color as time passes.
    const elapsed = 1 - this.remainingMs / totalMs;

    // The +1 hides the small dot the rounded line cap would show at 0%
    this.dashOffset = elapsed <= 0
      ? this.circumference + 1
      : this.circumference * (1 - elapsed);
  }

  // ==============================
  // STATISTICS
  // ==============================
  setPeriod(period: Period) {
    this.period = period;
    this.computeStats();
  }

  private computeStats() {
    const now = new Date();
    const start = this.period === 'weekly'
      ? this.getStartOfWeek(now)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const inRange = this.tasks.filter(t =>
      new Date(t.date) >= start &&
      new Date(t.date) <= now
    );

    const completed = inRange.filter(t => t.completed);
    const pending = inRange.filter(t => !t.completed);

    this.totalCompleted = completed.length;
    this.totalPending = pending.length;

    const total = inRange.length;
    this.completionRate = total === 0
      ? 0
      : Math.round((completed.length / total) * 100);

    this.buildChart(inRange, start);
    this.buildCategoryStats(inRange);
    this.buildPriorityStats(inRange);
    this.computeBestDay(inRange);
  }

  private buildChart(tasks: Task[], start: Date) {
    if (this.period === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const counts = new Array(7).fill(0);

      tasks.forEach(t => {
        if (t.completed) {
          counts[new Date(t.date).getDay()]++;
        }
      });

      const max = Math.max(...counts, 1);
      this.chartMax = max;

      this.chartData = days.map((label, i) => ({
        label,
        value: counts[i],
        height: counts[i] === 0 ? 4 : (counts[i] / max) * 100
      }));
    } else {
      const weeks = ['W1', 'W2', 'W3', 'W4'];
      const counts = new Array(4).fill(0);

      tasks.forEach(t => {
        if (t.completed) {
          const week = Math.floor(
            (new Date(t.date).getDate() - 1) / 7
          );
          if (week >= 0 && week < 4) counts[week]++;
        }
      });

      const max = Math.max(...counts, 1);
      this.chartMax = max;

      this.chartData = weeks.map((label, i) => ({
        label,
        value: counts[i],
        height: counts[i] === 0 ? 4 : (counts[i] / max) * 100
      }));
    }
  }

  private buildCategoryStats(tasks: Task[]) {
    const categories = ['School', 'Work', 'Personal', 'Others'];
    const completed = tasks.filter(t => t.completed);
    const total = completed.length || 1;

    this.categoryStats = categories.map(name => {
      const count = completed.filter(t => t.category === name).length;
      return {
        name,
        count,
        percent: Math.round((count / total) * 100)
      };
    }).filter(c => c.count > 0);
  }

  private buildPriorityStats(tasks: Task[]) {
    const completed = tasks.filter(t => t.completed);
    const labels: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

    this.priorityStats = labels.map(label => ({
      label,
      count: completed.filter(t => t.priority === label).length
    }));
  }

  private computeBestDay(tasks: Task[]) {
    const completed = tasks.filter(t => t.completed);
    if (completed.length === 0) {
      this.bestDay = null;
      return;
    }

    const map = new Map<string, number>();
    completed.forEach(t => {
      const key = new Date(t.date).toDateString();
      map.set(key, (map.get(key) || 0) + 1);
    });

    let best = { label: '', count: 0 };
    map.forEach((count, key) => {
      if (count > best.count) {
        best = {
          label: new Date(key).toLocaleDateString('en-US', {
            weekday: 'short'
          }),
          count
        };
      }
    });

    this.bestDay = best;
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }
}