import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseApp } from '../../../main';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    RouterLink, 
    CommonModule, 
    FormsModule
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {} 

  isPasswordVisible = false;
  pswEyes() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  async login() {
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      console.log("User logged in:", userCredential.user);
      
      // Saving login log with Firebase
      await this.loginLog(userCredential.user.uid, this.email);

      // Login successful, navigate to home page
      this.router.navigate(['/home']);
    } catch (error) {
      console.error("Error login:", error);
      alert("Login failed. Please try again");
    }
  }

  async loginLog(uid: string, email: string): Promise<void> {
    const db = getFirestore(firebaseApp);
    try {
      const curentTime: string = Date.now().toString();
      // Add data to Firestore's login_log collection 
      await addDoc(collection(db, 'login_log'), {
        uid: uid,
        email: email,
        loginTime: curentTime,
        createdAt: new Date()
      });

      //keep login time
      localStorage.setItem("loginTime", curentTime);

      console.log("login log saved successfully!");
    } catch (error) {
      console.error("Error saving login log:", error);
      throw error;
    }
  }
}
