import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user$ = this.firebase.user$;

  constructor(private firebase: FirebaseService) {}

  async register(email: string, password: string, displayName: string, phone: string) {
    const auth = this.firebase.requireAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    await setDoc(doc(this.firebase.requireFirestore(), 'users', credential.user.uid), {
      displayName,
      email,
      phone,
      createdAt: serverTimestamp()
    });
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.firebase.requireAuth(), email, password);
  }

  async logout() {
    await signOut(this.firebase.requireAuth());
  }

  async resetPassword(email: string) {
    await sendPasswordResetEmail(this.firebase.requireAuth(), email);
  }
}