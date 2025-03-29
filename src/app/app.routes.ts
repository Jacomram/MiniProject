import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'tasks', loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent) },
  { path: 'about', loadComponent: () => import('./components/about-us/about-us.component').then(m => m.AboutUsComponent) },
  { path: 'login', loadComponent: () => import('./components/log-in/log-in.component').then(m => m.LogInComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'invoice', loadComponent: () => import('./components/invoice/invoice.component').then(m => m.InvoiceComponent) },
  { path: 'products', loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent) },
];