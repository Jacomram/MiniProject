      import { bootstrapApplication } from '@angular/platform-browser';
      import { appConfig } from './app/app.config';
      import { AppComponent } from './app/app.component';
      import { initializeApp } from "firebase/app";

      const firebaseConfig = {
        apiKey: "AIzaSyD2EnID62h8nI59b9-LjtkXGS_GbNvBdSA",
        authDomain: "miniproject-team1.firebaseapp.com",
        projectId: "miniproject-team1",
        storageBucket: "miniproject-team1.appspot.com",
        messagingSenderId: "831935087620",
        appId: "1:831935087620:web:6d0679c13aa816fdf86151"
      };

      export const firebaseApp = initializeApp(firebaseConfig);
      // console.log("Firebase initialized successfully:", firebaseApp);


      bootstrapApplication(AppComponent, appConfig)
        .catch((err) => console.error(err));
