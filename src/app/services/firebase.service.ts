import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged
} from 'firebase/auth';
import {
  Firestore,
  connectFirestoreEmulator,
  getFirestore
} from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  readonly configured = !Object.values(environment.firebase).some(value =>
    value.startsWith('YOUR_')
  );
  readonly app: FirebaseApp | null;
  readonly auth: Auth | null;
  readonly firestore: Firestore | null;
  readonly user$ = new BehaviorSubject<User | null>(null);

  constructor() {
    if (!this.configured) {
      this.app = null;
      this.auth = null;
      this.firestore = null;
      return;
    }

    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    if (environment.useFirebaseEmulators) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(this.firestore, '127.0.0.1', 8080);
    }
    onAuthStateChanged(this.auth, user => this.user$.next(user));
  }

  requireAuth(): Auth {
    if (!this.auth) {
      throw new Error('Connect your Firebase project in the environment files first.');
    }
    return this.auth;
  }

  requireFirestore(): Firestore {
    if (!this.firestore) {
      throw new Error('Connect your Firebase project in the environment files first.');
    }
    return this.firestore;
  }
}