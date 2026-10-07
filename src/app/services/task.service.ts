import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { Unsubscribe } from 'firebase/auth';
import { FirebaseService } from './firebase.service';

export interface Task {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  completed: boolean;
  completedAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks$ = new BehaviorSubject<Task[]>([]);
  private stopTaskListener?: Unsubscribe;

  readonly tasks = this.tasks$.asObservable();

  constructor(private firebase: FirebaseService) {
    this.firebase.user$.subscribe(user => {
      this.stopTaskListener?.();
      this.stopTaskListener = undefined;
      this.tasks$.next([]);
      if (!user || !this.firebase.firestore) return;

      this.stopTaskListener = onSnapshot(
        collection(this.firebase.firestore, 'users', user.uid, 'tasks'),
        snapshot => this.tasks$.next(snapshot.docs.map(taskDoc => {
          const data = taskDoc.data();
          return {
            ...data,
            id: Number(taskDoc.id),
            date: this.toDate(data['date']),
            completedAt: data['completedAt'] ? this.toDate(data['completedAt']) : undefined
          } as Task;
        }))
      );
    });
  }

  getAll(): Task[] {
    return this.tasks$.value;
  }

  async add(task: Task) {
    await this.writeTask(task);
  }

  async update(task: Task) {
    await this.writeTask(task);
  }

  async remove(id: number) {
    await deleteDoc(this.taskReference(id));
  }

  async setCompleted(task: Task, completed: boolean) {
    await this.update({
      ...task,
      completed,
      completedAt: completed ? new Date() : undefined
    });
  }

  private taskReference(id: number) {
    const user = this.firebase.user$.value;
    if (!user) throw new Error('Sign in to manage tasks.');
    return doc(this.firebase.requireFirestore(), 'users', user.uid, 'tasks', String(id));
  }

  private async writeTask(task: Task) {
    const user = this.firebase.user$.value;
    if (!user) throw new Error('Sign in to manage tasks.');

    const { id, completedAt, ...data } = task;
    await setDoc(this.taskReference(task.id), {
      ...data,
      userId: user.uid,
      ...(completedAt ? { completedAt } : {})
    });
  }

  private toDate(value: unknown): Date {
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) return value;
    return new Date(String(value));
  }
}
