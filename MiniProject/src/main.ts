import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Firebase setting object
const firebaseConfig = {
  apiKey: "AIzaSyD2EnID62h8nI59b9-LjtkXGS_GbNvBdSA",
  authDomain: "miniproject-team1.firebaseapp.com",
  projectId: "miniproject-team1",
  storageBucket: "miniproject-team1.firebasestorage.app",
  messagingSenderId: "831935087620",
  appId: "1:831935087620:web:6d0679c13aa816fdf86151"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
}).catch(err => console.error(err));