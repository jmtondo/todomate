import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },

  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash/splash.page').then(
        (m) => m.SplashPage
      ),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(
        (m) => m.LoginPage
      ),
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.page').then(
        (m) => m.SignupPage
      ),
  },

  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then(
        (m) => m.HomePage
      ),
  },

  {
  path: 'new-task',
  loadComponent: () =>
    import('./pages/add-task/add-task.page')
      .then(m => m.AddTaskPage),
  },

  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/tasks/tasks.page').then(
        (m) => m.TasksPage
      ),
  },

  {
    path: 'task-details',
    loadComponent: () =>
      import('./pages/task-details/task-details.page').then(
        (m) => m.TaskDetailsPage
      ),
  },

  {
    path: 'add-task',
    loadComponent: () =>
      import('./pages/add-task/add-task.page').then(
        (m) => m.AddTaskPage
      ),
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.page').then(
        (m) => m.ProfilePage
      ),
  },

];