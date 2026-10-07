# todomate

## Firebase backend

TodoMate uses Firebase Authentication (email/password) and Cloud Firestore. Each account's profile is stored at `users/{uid}` and tasks at `users/{uid}/tasks/{taskId}`. Task changes sync live between signed-in devices.

### Local backend

The app connects to the configured Firebase project by default. To use the Firebase Emulator Suite instead, set `useFirebaseEmulators` to `true` in `src/environments/environment.ts`, install a supported Java runtime, then run `npm run firebase:emulators` in one terminal and `npm start` in another. The Emulator UI is available at `http://127.0.0.1:4000`.

The emulator uses local data and does not require a Google account or real Firebase project. Emulator data is not persisted between runs unless emulator export/import is configured.

### Cloud backend

1. Enable **Authentication > Email/Password** and create a Cloud Firestore database in your Firebase project.
2. Publish the included `firestore.rules` in **Firestore Database > Rules**.
3. Sign in to Firebase CLI with `npx firebase-tools login`, select `todomate-a7bf6` with `npx firebase-tools use --add`, then deploy the rules with `npm run firebase:deploy-rules`.

Never deploy permissive Firestore rules; the included rules restrict each user to their own profile and tasks.