import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  IonContent,
  IonButton,
  IonIcon,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import {
  createOutline,
  languageOutline,
  starOutline,
  documentTextOutline,
  helpCircleOutline,
  chatbubbleEllipsesOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  chevronForward,
  logOutOutline,
  star
} from 'ionicons/icons';

/* =========================================================
   INLINE STAR RATING MODAL (SHADING STARS)
   ========================================================= */
@Component({
  selector: 'app-rate-stars-modal',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="modal-overlay" (click)="dismiss()">
      <div class="rate-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <h2>Your opinion matters to us!</h2>
        <p>How was your experience with TodoMate?</p>

        <!-- Dynamic Shading Stars -->
        <div class="stars-row">
          <ion-icon
            *ngFor="let s of [1, 2, 3, 4, 5]"
            [name]="s <= rating ? 'star' : 'star-outline'"
            [class.shaded]="s <= rating"
            (click)="rating = s">
          </ion-icon>
        </div>

        <!-- Action Buttons -->
        <div class="actions">
          <button class="btn-cancel" (click)="dismiss()">Maybe later</button>
          <button class="btn-submit" [disabled]="rating === 0" (click)="submit()">
            Submit
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .rate-card {
      width: 100%;
      max-width: 320px;
      background: #ffffff;
      border-radius: 20px;
      padding: 24px 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      animation: popIn 0.25s ease;
    }

    h2 {
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 700;
      color: #17161b;
    }

    p {
      margin: 0 0 20px;
      font-size: 13px;
      color: #17161b;
      opacity: 0.6;
    }

    /* Interactive Stars */
    .stars-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;

      ion-icon {
        font-size: 34px;
        color: #d1d5db; /* Unfilled light gray star */
        cursor: pointer;
        transition: color 0.2s ease, transform 0.15s ease;

        &.shaded {
          color: #3760f9; /* Blue filled star matching image accent */
        }

        &:active {
          transform: scale(1.2);
        }
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;

      button {
        width: 100%;
        height: 42px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease, opacity 0.15s ease;
      }

      .btn-submit {
        background: #3760f9;
        border: none;
        color: #ffffff;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .btn-cancel {
        background: transparent;
        border: none;
        color: #17161b;
        opacity: 0.55;

        &:hover {
          opacity: 0.85;
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes popIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class RateStarsModal {
  rating: number = 0;

  constructor(private modalController: ModalController) {
    addIcons({ star, starOutline });
  }

  dismiss() {
    this.modalController.dismiss(null, 'cancel');
  }

  submit() {
    if (this.rating > 0) {
      this.modalController.dismiss({ rating: this.rating }, 'confirm');
    }
  }
}

/* =========================================================
   MAIN SETTINGS PAGE
   ========================================================= */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon
  ]
})
export class SettingsPage implements OnDestroy {

  userName = 'Loading account…';
  userEmail = '';
  language = 'English';
  private userSubscription: Subscription;

  constructor(
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private auth: AuthService,
    private firebase: FirebaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.userSubscription = this.auth.user$.subscribe(user => {
      if (!user) {
        this.userName = 'Not signed in';
        this.userEmail = '';
        this.cdr.markForCheck();
        return;
      }

      this.userName = user.displayName?.trim() || this.nameFromEmail(user.email);
      this.userEmail = user.email || 'No email associated';
      this.cdr.markForCheck();
      void this.loadProfileName(user);
    });

    addIcons({
      createOutline,
      languageOutline,
      starOutline,
      documentTextOutline,
      helpCircleOutline,
      chatbubbleEllipsesOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
      chevronForward,
      logOutOutline
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  private async loadProfileName(user: User) {
    if (user.displayName?.trim() || !this.firebase.firestore) return;

    try {
      const profile = await getDoc(doc(this.firebase.firestore, 'users', user.uid));
      if (this.auth.user$.value?.uid !== user.uid) return;

      const displayName = profile.data()?.['displayName'];
      if (typeof displayName === 'string' && displayName.trim()) {
        this.userName = displayName.trim();
        this.cdr.markForCheck();
      }
    } catch (error) {
      if (this.auth.user$.value?.uid !== user.uid) return;
      const toast = await this.toastController.create({
        message: error instanceof Error ? error.message : String(error),
        duration: 2600,
        position: 'top'
      });
      await toast.present();
    }
  }

  private nameFromEmail(email: string | null): string {
    const localPart = email?.split('@')[0];
    if (!localPart) return 'User';

    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  get userInitials(): string {
    const parts = this.userName.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.substring(0, 2).toUpperCase() || 'U';
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }

  openPage(page: string) {
    if (page === 'rate') {
      this.openRateModal();
    } else {
      this.presentInfo(page);
    }
  }

  async openRateModal() {
    const modal = await this.modalController.create({
      component: RateStarsModal
    });

    modal.onDidDismiss().then((res) => {
      if (res.role === 'confirm' && res.data?.rating) {
        this.showRatingToast(res.data.rating);
      }
    });

    await modal.present();
  }

  private async showRatingToast(rating: number) {
    const message = rating >= 4
      ? 'Thank you for your rating! We are glad you love TodoMate!'
      : 'Thank you for your feedback! We will keep improving TodoMate.';

    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom'
    });

    await toast.present();
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Log Out',
      message: 'Are you sure you want to log out of your account?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Log Out',
          role: 'destructive',
          handler: async () => {
            try {
              await this.auth.logout();
              await this.router.navigate(['/login']);
            } catch (error) {
              const toast = await this.toastController.create({
                message: error instanceof Error ? error.message : String(error),
                duration: 2600,
                position: 'top'
              });
              await toast.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async presentInfo(page: string) {
    const info: Record<string, { title: string; message: string }> = {
      terms: {
        title: 'Terms & Conditions',
        message: 'By using TodoMate, you agree to use the app responsibly and keep your account information safe.'
      },
      faq: {
        title: 'Frequently Asked Questions',
        message: 'Find quick answers to common questions about TodoMate, your tasks, and account.'
      },
      help: {
        title: 'Help & Support',
        message: 'Need a hand? Reach out to our support team and we will get back to you as soon as possible.'
      },
      privacy: {
        title: 'Privacy Policy',
        message: 'Learn how we collect, use, and protect your personal information while using TodoMate.'
      },
      about: {
        title: 'About TodoMate',
        message: 'TodoMate v1.0.0 — your friendly productivity companion for managing tasks and staying focused.'
      }
    };

    const data = info[page] || {
      title: page,
      message: 'Information coming soon.'
    };

    const alert = await this.alertController.create({
      header: data.title,
      message: data.message,
      buttons: ['OK']
    });
    await alert.present();
  }
}